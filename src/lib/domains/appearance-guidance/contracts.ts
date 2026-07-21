import { z } from 'zod';

export const skinMetricSchema = z.object({
	key: z.string(),
	label: z.string(),
	score: z.number().min(0).max(100),
	status: z.enum(['good', 'attention', 'priority'])
});

export const appearanceGuidanceSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	impact: z.enum(['high', 'medium', 'low']),
	expectedImpact: z.number().int().min(1).max(20),
	difficulty: z.enum(['easy', 'moderate'])
});

export type SkinMetric = z.infer<typeof skinMetricSchema>;
export type AppearanceGuidance = z.infer<typeof appearanceGuidanceSchema>;
