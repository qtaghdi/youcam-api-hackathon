import { defineMutation, type InferSchema } from 'boundra';
import { z } from 'zod';
import {
	appearanceGuidanceSchema,
	skinMetricSchema
} from '$lib/domains/appearance-guidance/public';

export const analysisResultSchema = z.object({
	mode: z.enum(['live', 'demo']),
	createdAt: z.string(),
	summary: z.string(),
	overallScore: z.number().min(0).max(100),
	skinTone: z.object({
		hex: z.string().regex(/^#[0-9a-f]{6}$/i),
		label: z.string(),
		undertone: z.string()
	}),
	metrics: z.array(skinMetricSchema),
	guidance: z.array(appearanceGuidanceSchema),
	lightingImageUrl: z.string().url().nullable(),
	raw: z.record(z.string(), z.unknown()).optional()
});

export const analysisLocaleSchema = z.enum(['en', 'ko']);
export const analysisScenarioSchema = z.enum(['interview', 'meeting', 'presentation', 'profile']);

const imageFileSchema = z.custom<File>(
	(value) => {
		if (value === null || typeof value !== 'object') return false;
		const candidate = value as Partial<File>;
		return (
			typeof candidate.name === 'string' &&
			typeof candidate.type === 'string' &&
			typeof candidate.size === 'number' &&
			typeof candidate.arrayBuffer === 'function'
		);
	},
	{ message: 'Expected an uploaded image file.' }
);

export const analyzeImageInputSchema = z.object({
	image: imageFileSchema,
	brightness: z.number().min(0).max(1),
	locale: analysisLocaleSchema,
	scenario: analysisScenarioSchema
});

export const analyzeImageMutation = defineMutation({
	name: 'analyze-image',
	input: analyzeImageInputSchema,
	result: analysisResultSchema
});

export type AnalysisResult = InferSchema<typeof analysisResultSchema>;
export type AnalyzeImageInput = InferSchema<typeof analyzeImageInputSchema>;
export type AnalysisLocale = InferSchema<typeof analysisLocaleSchema>;
export type AnalysisScenario = InferSchema<typeof analysisScenarioSchema>;

// Keep the multipart request comfortably below Vercel Functions' 4.5 MB body limit.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_PREPARED_IMAGE_BYTES = 3_500_000;
export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 1920;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
