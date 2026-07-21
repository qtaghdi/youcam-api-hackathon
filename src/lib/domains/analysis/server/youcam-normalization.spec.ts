import { describe, expect, it } from 'vitest';
import { findResultUrl, normalizeSkinMetrics, normalizeSkinTone } from './youcam-normalization';

describe('YouCam result normalization', () => {
	it('normalizes nested fractional and inverse skin signals', () => {
		const metrics = normalizeSkinMetrics({ data: { radiance: 0.82, texture: 0.2 } });
		expect(metrics.find((item) => item.key === 'radiance')?.score).toBe(82);
		expect(metrics.find((item) => item.key === 'texture')?.score).toBe(80);
	});

	it('uses safe tone defaults for malformed colors', () => {
		expect(normalizeSkinTone({ color: { skin_color: 'not-a-color' } }).hex).toBe('#c89578');
	});

	it('finds a nested lighting result URL', () => {
		expect(findResultUrl({ results: [{ image_url: 'https://example.com/lit.jpg' }] })).toBe(
			'https://example.com/lit.jpg'
		);
	});
});
