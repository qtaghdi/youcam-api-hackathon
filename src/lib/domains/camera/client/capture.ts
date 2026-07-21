export type CoverCrop = {
	sx: number;
	sy: number;
	sWidth: number;
	sHeight: number;
};

export function calculateCoverCrop(
	sourceWidth: number,
	sourceHeight: number,
	targetWidth: number,
	targetHeight: number
): CoverCrop {
	const sourceRatio = sourceWidth / sourceHeight;
	const targetRatio = targetWidth / targetHeight;

	if (sourceRatio > targetRatio) {
		const sWidth = sourceHeight * targetRatio;
		return { sx: (sourceWidth - sWidth) / 2, sy: 0, sWidth, sHeight: sourceHeight };
	}

	const sHeight = sourceWidth / targetRatio;
	return { sx: 0, sy: (sourceHeight - sHeight) / 2, sWidth: sourceWidth, sHeight };
}

function canvasToBlob(canvas: HTMLCanvasElement) {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error('The camera image could not be captured.')),
			'image/jpeg',
			0.9
		);
	});
}

export async function captureCameraFrame(
	video: HTMLVideoElement,
	width = 1080,
	height = 1350
): Promise<File> {
	if (!video.videoWidth || !video.videoHeight) {
		throw new Error('The camera is not ready to capture.');
	}

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Camera capture is not supported in this browser.');

	const crop = calculateCoverCrop(video.videoWidth, video.videoHeight, width, height);
	context.translate(width, 0);
	context.scale(-1, 1);
	context.drawImage(video, crop.sx, crop.sy, crop.sWidth, crop.sHeight, 0, 0, width, height);

	const blob = await canvasToBlob(canvas);
	return new File([blob], `presence-${Date.now()}.jpg`, { type: 'image/jpeg' });
}
