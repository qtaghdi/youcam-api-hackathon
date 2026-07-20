export type AnalysisErrorLocale = 'en' | 'ko';

const inputErrorMessages = {
	en: {
		belowMinSize: 'Use a photo that is at least 320 pixels wide and tall.',
		noFace: 'We couldn’t find a clear face. Face the camera and keep your full face visible.',
		faceTooSmall: 'Move a little closer so your face fills more of the frame.',
		faceOutOfFrame: 'Move slightly back and keep your forehead, chin, and both cheeks in frame.',
		notForward: 'Look directly into the camera lens and keep your head level.',
		angleUpward: 'Lower your chin slightly and look directly into the camera lens.',
		angleDownward: 'Lift your chin slightly and look directly into the camera lens.',
		angleLeftward: 'Turn your face slightly to the right until both cheeks are even.',
		angleRightward: 'Turn your face slightly to the left until both cheeks are even.',
		tiltLeft: 'Gently tilt your head to the right until your eyes are level.',
		tiltRight: 'Gently tilt your head to the left until your eyes are level.',
		lighting: 'Move toward a brighter, even light source and avoid strong backlight.'
	},
	ko: {
		belowMinSize: '가로와 세로가 모두 320픽셀 이상인 사진을 사용해 주세요.',
		noFace: '얼굴을 선명하게 찾지 못했습니다. 카메라를 정면으로 보고 얼굴 전체가 보이게 해주세요.',
		faceTooSmall: '얼굴이 프레임을 더 채우도록 카메라에 조금 가까이 이동해 주세요.',
		faceOutOfFrame: '조금 뒤로 이동해 이마와 턱, 양쪽 볼이 모두 프레임 안에 보이게 해주세요.',
		notForward: '카메라 렌즈를 정면으로 바라보고 고개를 수평으로 유지해 주세요.',
		angleUpward: '턱을 조금 내리고 카메라 렌즈를 정면으로 바라봐 주세요.',
		angleDownward: '턱을 조금 들고 카메라 렌즈를 정면으로 바라봐 주세요.',
		angleLeftward: '양쪽 볼이 고르게 보이도록 얼굴을 오른쪽으로 조금 돌려주세요.',
		angleRightward: '양쪽 볼이 고르게 보이도록 얼굴을 왼쪽으로 조금 돌려주세요.',
		tiltLeft: '두 눈이 수평이 되도록 고개를 오른쪽으로 살짝 기울여 주세요.',
		tiltRight: '두 눈이 수평이 되도록 고개를 왼쪽으로 살짝 기울여 주세요.',
		lighting: '강한 역광을 피하고 얼굴 전체에 밝고 고른 빛이 닿도록 이동해 주세요.'
	}
} as const;

export function getAnalysisInputErrorMessage(
	code: string,
	locale: AnalysisErrorLocale
): string | null {
	const messages = inputErrorMessages[locale];
	const exact: Record<string, string> = {
		error_below_min_image_size: messages.belowMinSize,
		error_face_position_invalid: messages.notForward,
		error_face_position_too_small: messages.faceTooSmall,
		error_face_position_out_of_boundary: messages.faceOutOfFrame,
		error_face_not_forward_facing: messages.notForward,
		error_face_angle_invalid: messages.notForward,
		error_face_angle_upward: messages.angleUpward,
		error_face_angle_downward: messages.angleDownward,
		error_face_angle_leftward: messages.angleLeftward,
		error_face_angle_rightward: messages.angleRightward,
		error_face_angle_left_tilt: messages.tiltLeft,
		error_face_angle_right_tilt: messages.tiltRight,
		error_insufficient_lighting: messages.lighting
	};

	if (exact[code]) return exact[code];
	if (code.includes('no_face')) return messages.noFace;
	if (code.includes('face_too_small')) return messages.faceTooSmall;
	if (code.includes('face') && code.includes('out_of_boundary')) return messages.faceOutOfFrame;
	return null;
}
