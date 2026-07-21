import { createBoundraClient } from 'boundra';
import { describe, expect, it } from 'vitest';
import { analyzeImageMutation, type AnalyzeImageInput } from './contracts';

const image = {
	name: 'presence.jpg',
	type: 'image/jpeg',
	size: 1024,
	arrayBuffer: async () => new ArrayBuffer(0)
} as File;

const validInput: AnalyzeImageInput = {
	image,
	brightness: 0.58,
	locale: 'en',
	scenario: 'interview'
};

const validResult = {
	mode: 'demo' as const,
	createdAt: '2026-07-21T00:00:00.000Z',
	summary: 'Ready for review.',
	overallScore: 76,
	skinTone: {
		hex: '#c89578',
		label: 'Natural medium',
		undertone: 'Neutral-warm'
	},
	metrics: [],
	guidance: [],
	lightingImageUrl: null
};

describe('analyze image Boundra contract', () => {
	it('accepts a valid mutation input and result', async () => {
		const client = createBoundraClient(async () => validResult);

		await expect(client.mutation(analyzeImageMutation, validInput)).resolves.toEqual(validResult);
	});

	it('rejects invalid input before the transport runs', async () => {
		const client = createBoundraClient(async () => validResult);

		await expect(
			client.mutation(analyzeImageMutation, { ...validInput, brightness: 2 })
		).rejects.toMatchObject({ code: 'RUNTIME-001', phase: 'input' });
	});

	it('rejects a transport result that breaks the contract', async () => {
		const client = createBoundraClient(async () => ({ ...validResult, overallScore: 101 }));

		await expect(client.mutation(analyzeImageMutation, validInput)).rejects.toMatchObject({
			code: 'RUNTIME-002',
			phase: 'result'
		});
	});
});
