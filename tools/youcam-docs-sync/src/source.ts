import { load } from 'cheerio';
import TurndownService from 'turndown';
import type { FetchResult, SourceInspection, SupplementalDocument } from './types';

const OPENAPI_LINK_PATTERN =
	/(?:openapi|swagger|_bundle\/reference|\.ya?ml(?:$|[?#])|\.json(?:$|[?#]))/i;
const RELEVANT_SECTION_PATTERN =
	/(overview|integration guide|file specs|supported formats|dimensions|errors?|servers?|security|authentication|sample|usage)/i;

function absoluteUrl(value: string, baseUrl: string) {
	try {
		return new URL(value, baseUrl).toString();
	} catch {
		return null;
	}
}

function discoverMarkdownLinks(markdown: string, baseUrl: string) {
	const links = new Set<string>();
	const patterns = [
		/\[[^\]]*]\((https?:\/\/[^)\s]+|[^)\s]+)\)/g,
		/<(https?:\/\/[^>\s]+)>/g,
		/https?:\/\/[^\s)"'<>]+/g
	];
	for (const pattern of patterns) {
		for (const match of markdown.matchAll(pattern)) {
			const candidate = match[1] ?? match[0];
			if (!OPENAPI_LINK_PATTERN.test(candidate)) continue;
			const resolved = absoluteUrl(candidate, baseUrl);
			if (resolved) links.add(resolved);
		}
	}
	return [...links];
}

function extractRelevantMarkdown(markdown: string) {
	const normalized = markdown
		.replace(/\r\n/g, '\n')
		.replace(/<!--[\s\S]*?-->/g, '')
		.trim();
	if (!normalized) return '';

	const lines = normalized.split('\n');
	const sections: string[][] = [];
	let current: string[] = [];
	let keep = false;

	for (const line of lines) {
		const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
		if (heading) {
			if (current.length && keep) sections.push(current);
			current = [line];
			keep =
				heading[1].length === 1 ||
				RELEVANT_SECTION_PATTERN.test(heading[2]) ||
				/^file specs/i.test(heading[2]);
			continue;
		}
		current.push(line);
	}
	if (current.length && keep) sections.push(current);

	const selected = sections
		.map((section) => section.join('\n').trim())
		.filter(Boolean)
		.join('\n\n');
	return (selected || normalized).slice(0, 40_000);
}

function inspectHtml(document: FetchResult): SourceInspection {
	const $ = load(document.body);
	const links = new Set<string>();
	const pageDataUrls = new Set<string>();
	$('a[href]').each((_, element) => {
		const href = $(element).attr('href');
		if (!href || !OPENAPI_LINK_PATTERN.test(href)) return;
		const resolved = absoluteUrl(href, document.url);
		if (resolved) links.add(resolved);
	});
	$('link[href*="/page-data/"]').each((_, element) => {
		const href = $(element).attr('href');
		if (!href) return;
		const resolved = absoluteUrl(href, document.url);
		if (resolved) pageDataUrls.add(resolved);
	});

	$('script, style, nav, footer, header, noscript').remove();
	const root = $('main').first().length
		? $('main').first()
		: $('article').first().length
			? $('article').first()
			: $('body');
	const title = root.find('h1').first().text().trim() || $('title').text().trim() || document.url;
	const turndown = new TurndownService({
		headingStyle: 'atx',
		bulletListMarker: '-',
		codeBlockStyle: 'fenced'
	});
	const markdown = extractRelevantMarkdown(turndown.turndown(root.html() ?? ''));
	for (const discovered of discoverMarkdownLinks(markdown, document.url)) links.add(discovered);

	return {
		url: document.url,
		openApiUrls: [...links],
		pageDataUrls: [...pageDataUrls],
		supplemental: markdown ? { sourceUrl: document.url, title, markdown } : null
	};
}

function inspectMarkdown(document: FetchResult): SourceInspection {
	const markdown = extractRelevantMarkdown(document.body);
	const title =
		/^#\s+(.+)$/m.exec(markdown)?.[1]?.trim() ||
		decodeURIComponent(
			new URL(document.url).pathname.split('/').filter(Boolean).at(-1) ?? document.url
		);
	return {
		url: document.url,
		openApiUrls: discoverMarkdownLinks(document.body, document.url),
		pageDataUrls: [],
		supplemental: markdown ? { sourceUrl: document.url, title, markdown } : null
	};
}

export function inspectDocumentationSource(document: FetchResult): SourceInspection {
	const looksHtml =
		document.contentType.includes('text/html') || /^\s*<!doctype|^\s*<html/i.test(document.body);
	return looksHtml ? inspectHtml(document) : inspectMarkdown(document);
}

export function pageDataUrlFor(sourceUrl: string) {
	const url = new URL(sourceUrl);
	if (!url.pathname.startsWith('/reference/') || /\.(?:ya?ml|json|md)$/i.test(url.pathname)) {
		return null;
	}
	const pathname = url.pathname.replace(/\/+$/, '');
	return new URL(`/page-data${pathname}/data.json`, url.origin).toString();
}

export function inspectPageDataSource(document: FetchResult): SourceInspection | null {
	try {
		const data = JSON.parse(document.body) as Record<string, unknown>;
		const props = (data.props ?? {}) as Record<string, unknown>;
		const metadata = (props.metadata ?? {}) as Record<string, unknown>;
		const seo = (props.seo ?? {}) as Record<string, unknown>;
		const definitionId = props.definitionId;
		if (typeof definitionId !== 'string' || !definitionId) return null;

		const openApiUrl = new URL(
			`/_bundle/${definitionId.replace(/^\/+/, '')}`,
			document.url
		).toString();
		const markdown =
			typeof metadata.description === 'string' ? extractRelevantMarkdown(metadata.description) : '';
		const title =
			(typeof metadata.title === 'string' && metadata.title) ||
			(typeof seo.title === 'string' && seo.title) ||
			String(data.slug ?? definitionId);
		const sourceUrl =
			typeof data.slug === 'string' ? new URL(data.slug, document.url).toString() : document.url;
		const baseSlug = typeof props.baseSlug === 'string' ? props.baseSlug.replace(/\/+$/, '') : '';
		const currentSlug = typeof data.slug === 'string' ? data.slug.replace(/\/+$/, '') : '';
		return {
			url: document.url,
			openApiUrls: [openApiUrl],
			pageDataUrls:
				baseSlug && baseSlug !== currentSlug
					? [new URL(`/page-data${baseSlug}/data.json`, document.url).toString()]
					: [],
			supplemental: markdown ? { sourceUrl, title, markdown } : null
		};
	} catch {
		return null;
	}
}

export function mergeSupplemental(
	documents: SupplementalDocument[],
	next: SupplementalDocument | null
) {
	if (!next || documents.some((document) => document.sourceUrl === next.sourceUrl))
		return documents;
	return [...documents, next];
}
