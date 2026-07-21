import { implementMutation } from 'boundra';
import { analyzeImageMutation } from '$lib/domains/analysis/shared/public';
import { analyzeWithYouCam, buildDemoAnalysis, hasYouCamCredentials } from './youcam';

export const analyzeImageImplementation = implementMutation(
	analyzeImageMutation,
	async ({ image, brightness }) =>
		hasYouCamCredentials()
			? analyzeWithYouCam(image, brightness)
			: buildDemoAnalysis(image, brightness)
);
