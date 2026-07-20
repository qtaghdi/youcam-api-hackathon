import { describe, expect, it } from 'vitest';
import { getAnalysisInputErrorMessage } from './errors';

describe('analysis input errors', () => {
	it('turns a face angle code into an actionable localized message', () => {
		expect(getAnalysisInputErrorMessage('error_face_angle_downward', 'ko')).toContain(
			'턱을 조금 들고'
		);
		expect(getAnalysisInputErrorMessage('error_face_angle_downward', 'en')).toContain(
			'Lift your chin'
		);
	});

	it('keeps unknown service errors private', () => {
		expect(getAnalysisInputErrorMessage('unknown_internal_error', 'en')).toBeNull();
	});
});
