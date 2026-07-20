import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FetchResult } from './types';

type CacheMetadata = {
	url: string;
	contentType: string;
	etag?: string;
	lastModified?: string;
};

const USER_AGENT =
	'Presence-YouCam-Docs-Sync/1.0 (+https://github.com/qtaghdi/youcam-api-hackathon)';

function cacheKey(url: string) {
	return createHash('sha256').update(url).digest('hex');
}

async function readCached(cacheDirectory: string, url: string) {
	const key = cacheKey(url);
	try {
		const [body, metadataText] = await Promise.all([
			readFile(path.join(cacheDirectory, `${key}.body`), 'utf8'),
			readFile(path.join(cacheDirectory, `${key}.json`), 'utf8')
		]);
		return { body, metadata: JSON.parse(metadataText) as CacheMetadata };
	} catch {
		return null;
	}
}

async function writeCached(cacheDirectory: string, url: string, body: string, response: Response) {
	const key = cacheKey(url);
	const metadata: CacheMetadata = {
		url,
		contentType: response.headers.get('content-type') ?? '',
		etag: response.headers.get('etag') ?? undefined,
		lastModified: response.headers.get('last-modified') ?? undefined
	};
	await mkdir(cacheDirectory, { recursive: true });
	await Promise.all([
		writeFile(path.join(cacheDirectory, `${key}.body`), body),
		writeFile(path.join(cacheDirectory, `${key}.json`), `${JSON.stringify(metadata, null, 2)}\n`)
	]);
}

export async function fetchDocument(
	url: string,
	cacheDirectory: string,
	timeoutMs = 25_000
): Promise<FetchResult> {
	const cached = await readCached(cacheDirectory, url);
	const headers = new Headers({
		Accept: 'application/yaml, application/json, text/markdown, text/html, text/plain;q=0.9',
		'User-Agent': USER_AGENT
	});
	if (cached?.metadata.etag) headers.set('If-None-Match', cached.metadata.etag);
	if (cached?.metadata.lastModified) {
		headers.set('If-Modified-Since', cached.metadata.lastModified);
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, {
			headers,
			redirect: 'follow',
			signal: controller.signal
		});
		if (response.status === 304 && cached) {
			return {
				url,
				body: cached.body,
				contentType: cached.metadata.contentType,
				fromCache: true
			};
		}
		if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
		const body = await response.text();
		await writeCached(cacheDirectory, url, body, response);
		return {
			url: response.url || url,
			body,
			contentType: response.headers.get('content-type') ?? '',
			fromCache: false
		};
	} catch (error) {
		if (cached) {
			console.warn(`Using cached copy after fetch failed: ${url}`);
			return {
				url,
				body: cached.body,
				contentType: cached.metadata.contentType,
				fromCache: true
			};
		}
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to fetch ${url}: ${reason}`, { cause: error });
	} finally {
		clearTimeout(timeout);
	}
}

export function wait(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
