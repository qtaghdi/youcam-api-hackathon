import {
	BoundraRuntimeError,
	createBoundraClient,
	type BoundraTransport,
	type BoundraTransportRequest
} from 'boundra';
import { analyzeImageMutation, type AnalyzeImageInput } from '$lib/domains/analysis/shared/public';

type AnalyzeImageOptions = {
	signal?: AbortSignal;
};

function createAnalysisTransport(options: AnalyzeImageOptions): BoundraTransport {
	return async (request: BoundraTransportRequest) => {
		if (request.kind !== 'mutation' || request.name !== analyzeImageMutation.name) {
			throw new Error(`Unsupported analysis contract: ${request.name}`);
		}

		const input = request.input as AnalyzeImageInput;
		const form = new FormData();
		form.set('image', input.image);
		form.set('brightness', String(input.brightness));
		form.set('locale', input.locale);
		form.set('scenario', input.scenario);

		const response = await fetch('/api/analyze', {
			method: 'POST',
			body: form,
			signal: options.signal
		});
		const body = (await response.json().catch(() => ({}))) as { message?: unknown };
		if (!response.ok) {
			throw new Error(typeof body.message === 'string' ? body.message : 'Analysis request failed.');
		}
		return body;
	};
}

export async function analyzeImage(input: AnalyzeImageInput, options: AnalyzeImageOptions = {}) {
	const client = createBoundraClient(createAnalysisTransport(options));
	try {
		return await client.mutation(analyzeImageMutation, input);
	} catch (error) {
		if (
			error instanceof BoundraRuntimeError &&
			error.phase === 'transport' &&
			error.cause instanceof Error
		) {
			throw error.cause;
		}
		throw error;
	}
}
