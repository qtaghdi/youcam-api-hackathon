import {
	MAX_IMAGE_DIMENSION,
	MAX_PREPARED_IMAGE_BYTES
} from '$lib/domains/analysis/shared/contracts';

export type PreparedImage = {
	file: File;
	originalBytes: number;
	wasOptimized: boolean;
};

type ImageDimensions = {
	image: HTMLImageElement;
	width: number;
	height: number;
};

function loadImage(file: File): Promise<ImageDimensions> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new Image();
		image.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ image, width: image.naturalWidth, height: image.naturalHeight });
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('The selected image could not be opened.'));
		};
		image.src = url;
	});
}

function encodeJpeg(
	image: HTMLImageElement,
	width: number,
	height: number,
	quality: number
): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Image preparation is not supported in this browser.');

	context.fillStyle = '#ffffff';
	context.fillRect(0, 0, width, height);
	context.drawImage(image, 0, 0, width, height);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('The image could not be prepared.'))),
			'image/jpeg',
			quality
		);
	});
}

function preparedName(name: string) {
	const base = name.replace(/\.[^.]+$/, '').trim() || 'presence-photo';
	return `${base}-prepared.jpg`;
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
	const source = await loadImage(file);
	const initialScale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(source.width, source.height));
	let width = Math.max(1, Math.round(source.width * initialScale));
	let height = Math.max(1, Math.round(source.height * initialScale));

	if (
		initialScale === 1 &&
		file.size <= MAX_PREPARED_IMAGE_BYTES &&
		(file.type === 'image/jpeg' || file.type === 'image/png')
	) {
		return { file, originalBytes: file.size, wasOptimized: false };
	}

	let quality = 0.9;
	let blob = await encodeJpeg(source.image, width, height, quality);

	while (blob.size > MAX_PREPARED_IMAGE_BYTES) {
		if (quality > 0.66) {
			quality = Math.max(0.66, quality - 0.08);
		} else if (Math.max(width, height) > 720) {
			const scale = Math.max(0.84, 720 / Math.max(width, height));
			width = Math.max(1, Math.round(width * scale));
			height = Math.max(1, Math.round(height * scale));
			quality = 0.82;
		} else {
			break;
		}

		blob = await encodeJpeg(source.image, width, height, quality);
	}

	if (blob.size > MAX_PREPARED_IMAGE_BYTES) {
		throw new Error('The image is still too large after preparation.');
	}

	return {
		file: new File([blob], preparedName(file.name), {
			type: 'image/jpeg',
			lastModified: Date.now()
		}),
		originalBytes: file.size,
		wasOptimized: true
	};
}
