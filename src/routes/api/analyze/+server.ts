import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { MAX_IMAGE_BYTES, SUPPORTED_IMAGE_TYPES } from '$lib/domains/analysis/shared/contracts';
import { getAnalysisInputErrorMessage } from '$lib/domains/analysis/shared/errors';
import {
	analyzeWithYouCam,
	buildDemoAnalysis,
	hasYouCamCredentials
} from '$lib/domains/analysis/server/youcam';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const image = form.get('image');
	const locale = form.get('locale') === 'ko' ? 'ko' : 'en';
	const errors =
		locale === 'ko'
			? {
					missing: '계속하려면 이미지를 선택해 주세요.',
					type: 'JPG 또는 PNG 이미지를 사용해 주세요.',
					size: '준비된 이미지는 4MB보다 작아야 합니다.',
					generic: '리뷰를 완료하지 못했습니다.'
				}
			: {
					missing: 'Choose an image to continue.',
					type: 'Use a JPG or PNG image.',
					size: 'The prepared image must be smaller than 4 MB.',
					generic: 'We couldn’t complete the review.'
				};
	const brightnessValue = Number(form.get('brightness'));
	const brightness = Number.isFinite(brightnessValue)
		? Math.max(0, Math.min(1, brightnessValue))
		: 0.58;

	if (!(image instanceof File)) {
		return json({ message: errors.missing }, { status: 400 });
	}
	if (!SUPPORTED_IMAGE_TYPES.includes(image.type as (typeof SUPPORTED_IMAGE_TYPES)[number])) {
		return json({ message: errors.type }, { status: 415 });
	}
	if (image.size > MAX_IMAGE_BYTES) {
		return json({ message: errors.size }, { status: 413 });
	}

	try {
		const result = hasYouCamCredentials()
			? await analyzeWithYouCam(image, brightness)
			: buildDemoAnalysis(image, brightness);
		return json(result);
	} catch (error) {
		console.error('YouCam analysis failed', error);
		const detail = error instanceof Error ? error.message : String(error);
		const inputMessage = getAnalysisInputErrorMessage(detail, locale);
		if (inputMessage) {
			return json({ code: detail, message: inputMessage }, { status: 422 });
		}
		return json({ message: dev && detail ? detail : errors.generic }, { status: 502 });
	}
};
