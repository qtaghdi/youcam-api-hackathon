import { env } from '$env/dynamic/private';
import { buildGuidance } from '$lib/domains/appearance-guidance/public';
import { analysisResultSchema, type AnalysisResult } from '$lib/domains/analysis/shared/contracts';
import { runYouCamFeature, type YouCamFeature } from './youcam-api';
import {
	createMetric,
	findResultUrl,
	normalizeSkinMetrics,
	normalizeSkinTone
} from './youcam-normalization';

const skinFeature: YouCamFeature = {
	version: 'v2.1',
	slug: 'skin-analysis',
	payload: (src_file_id) => ({
		src_file_id,
		dst_actions: ['radiance', 'texture', 'redness', 'dark_circle_v2', 'pore'],
		miniserver_args: { enable_mask_overlay: false },
		format: 'json',
		pf_camera_kit: false
	})
};

const toneFeature: YouCamFeature = {
	version: 'v2.0',
	slug: 'skin-tone-analysis',
	payload: (src_file_id) => ({ src_file_id, face_angle_strictness_level: 'medium' })
};

function lightingFeature(): YouCamFeature | null {
	const configuredSlug = env.YOUCAM_LIGHTING_FEATURE?.trim();
	if (configuredSlug === 'off' || configuredSlug === 'disabled') return null;
	const slug = configuredSlug || 'lighting';
	return { version: 'v2.0', slug, payload: (src_file_id) => ({ src_file_id }) };
}

function overallScore(metrics: ReturnType<typeof normalizeSkinMetrics>) {
	return Math.round(metrics.reduce((total, item) => total + item.score, 0) / metrics.length);
}

export async function analyzeWithYouCam(file: File, brightness: number): Promise<AnalysisResult> {
	const optionalLighting = lightingFeature();
	const [skin, tone, lighting] = await Promise.all([
		runYouCamFeature(file, skinFeature),
		runYouCamFeature(file, toneFeature),
		optionalLighting
			? runYouCamFeature(file, optionalLighting).catch(() => null)
			: Promise.resolve(null)
	]);

	const metrics = normalizeSkinMetrics(skin);
	const score = overallScore(metrics);
	return analysisResultSchema.parse({
		mode: 'live',
		createdAt: new Date().toISOString(),
		summary:
			score >= 75
				? 'You already make a clear, confident first impression.'
				: 'A few focused adjustments could make you appear even more confident.',
		overallScore: score,
		skinTone: normalizeSkinTone(tone),
		metrics,
		guidance: buildGuidance(metrics, brightness),
		lightingImageUrl: findResultUrl(lighting)
	});
}

export function buildDemoAnalysis(file: File, brightness: number): AnalysisResult {
	const variation = file.size % 9;
	const lightScore = Math.round(
		Math.max(48, Math.min(92, 100 - Math.abs(brightness - 0.58) * 145))
	);
	const metrics = [
		createMetric('radiance', 'Radiance', lightScore),
		createMetric('texture', 'Skin texture', 69 + (variation % 4)),
		createMetric('redness', 'Tone balance', 76 - (variation % 5)),
		createMetric('dark_circle', 'Under-eye clarity', 62 + (variation % 6)),
		createMetric('pore', 'Camera clarity', 78 - (variation % 3))
	];

	return analysisResultSchema.parse({
		mode: 'demo',
		createdAt: new Date().toISOString(),
		summary:
			'You’re almost ready. A few small changes to light and framing could make your presence feel noticeably stronger.',
		overallScore: overallScore(metrics),
		skinTone: { hex: '#c89578', label: 'Natural medium', undertone: 'Neutral-warm' },
		metrics,
		guidance: buildGuidance(metrics, brightness),
		lightingImageUrl: null
	});
}

export function hasYouCamCredentials() {
	return Boolean(env.YOUCAM_API_KEY);
}
