import type { SkinMetric } from '$lib/domains/appearance-guidance/public';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as JsonObject)
		: {};
}

function findNumber(value: unknown, aliases: string[]): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = findNumber(item, aliases);
			if (found !== undefined) return found;
		}
		return undefined;
	}
	const object = asObject(value);
	for (const [key, entry] of Object.entries(object)) {
		if (aliases.some((alias) => key.toLowerCase().includes(alias)) && typeof entry === 'number') {
			return entry;
		}
	}
	for (const entry of Object.values(object)) {
		const found = findNumber(entry, aliases);
		if (found !== undefined) return found;
	}
	return undefined;
}

function readinessScore(raw: number | undefined, fallback: number, inverse = true) {
	if (raw === undefined) return fallback;
	const normalized = raw <= 1 ? raw * 100 : raw;
	const score = inverse ? 100 - normalized : normalized;
	return Math.max(0, Math.min(100, Math.round(score)));
}

export function createMetric(key: string, label: string, score: number): SkinMetric {
	return {
		key,
		label,
		score,
		status: score >= 75 ? 'good' : score >= 55 ? 'attention' : 'priority'
	};
}

export function normalizeSkinMetrics(results: unknown): SkinMetric[] {
	return [
		createMetric(
			'radiance',
			'Radiance',
			readinessScore(findNumber(results, ['radiance']), 72, false)
		),
		createMetric('texture', 'Skin texture', readinessScore(findNumber(results, ['texture']), 68)),
		createMetric('redness', 'Tone balance', readinessScore(findNumber(results, ['redness']), 74)),
		createMetric(
			'dark_circle',
			'Under-eye clarity',
			readinessScore(findNumber(results, ['dark_circle', 'darkcircle']), 63)
		),
		createMetric('pore', 'Camera clarity', readinessScore(findNumber(results, ['pore']), 77))
	];
}

export function normalizeSkinTone(results: unknown) {
	const color = asObject(asObject(results).color);
	const hex = typeof color.skin_color === 'string' ? color.skin_color : '#c89578';
	return {
		hex: /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#c89578',
		label: 'Natural medium',
		undertone: 'Neutral-warm'
	};
}

export function findResultUrl(value: unknown): string | null {
	if (typeof value === 'string' && /^https?:\/\//.test(value)) return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			const url = findResultUrl(item);
			if (url) return url;
		}
	}
	for (const [key, entry] of Object.entries(asObject(value))) {
		if (
			(key.includes('url') || key.includes('image')) &&
			typeof entry === 'string' &&
			/^https?:\/\//.test(entry)
		) {
			return entry;
		}
		const url = findResultUrl(entry);
		if (url) return url;
	}
	return null;
}
