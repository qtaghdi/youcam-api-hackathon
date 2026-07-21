import { describe, expect, it } from 'vitest';
import type { AnalysisResult } from '$lib/domains/analysis/shared/public';
import type { CameraQuality } from '$lib/domains/camera/shared/public';
import { messages } from '$lib/i18n/messages';
import {
	buildAppearanceInsights,
	calculateComparisonGain,
	calculateExpectedGain,
	calculateProjectedScore,
	calculateReadinessScore,
	isCaptureReady,
	localizeMetrics
} from './report-view-model';

const quality: CameraQuality = {
	face: 'good',
	position: 'good',
	lighting: 'warning',
	background: 'good',
	brightness: 0.5,
	messageKey: 'brighterLight'
};

const result: AnalysisResult = {
	mode: 'demo',
	createdAt: '2026-07-21T00:00:00.000Z',
	summary: 'Summary',
	overallScore: 72,
	skinTone: { hex: '#c89578', label: 'Natural medium', undertone: 'Neutral-warm' },
	metrics: [
		{ key: 'radiance', label: 'Radiance', score: 62, status: 'attention' },
		{ key: 'texture', label: 'Texture', score: 70, status: 'attention' },
		{ key: 'redness', label: 'Tone', score: 76, status: 'good' },
		{ key: 'pore', label: 'Pore', score: 80, status: 'good' }
	],
	guidance: [
		{
			id: 'radiance',
			title: 'Light',
			description: 'Use light',
			impact: 'high',
			expectedImpact: 11,
			difficulty: 'easy'
		}
	],
	lightingImageUrl: null
};

describe('report view model', () => {
	it('calculates readiness and keeps capture gated by the required signals', () => {
		expect(calculateReadinessScore(quality)).toBe(84);
		expect(isCaptureReady(quality)).toBe(false);
	});

	it('caps projected and comparison scores safely', () => {
		const expected = calculateExpectedGain(result);
		expect(expected).toBe(6);
		expect(calculateProjectedScore({ ...result, overallScore: 94 }, expected)).toBe(96);
		expect(calculateComparisonGain(result, { ...result, overallScore: 78 })).toBe(0);
	});

	it('localizes metrics and separates YouCam, device, and derived insights', () => {
		expect(localizeMetrics(result, messages.en.report)[0].label).toBe('Radiance');
		expect(
			buildAppearanceInsights(result, quality, messages.en.report).map((item) => item.source)
		).toEqual(['YouCam signal', 'YouCam signal', 'On-device check', 'Presence-derived']);
	});
});
