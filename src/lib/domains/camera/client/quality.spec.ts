import { describe, expect, it } from 'vitest';
import { faceRotationDegrees } from './quality';

function rotationX(degrees: number) {
	const radians = (degrees * Math.PI) / 180;
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);

	return [1, 0, 0, 0, 0, cosine, sine, 0, 0, -sine, cosine, 0, 0, 0, 0, 1];
}

describe('face rotation', () => {
	it('reads pitch from MediaPipe’s column-major transformation matrix', () => {
		expect(faceRotationDegrees(rotationX(12))?.pitch).toBeCloseTo(12, 5);
		expect(faceRotationDegrees(rotationX(-8))?.pitch).toBeCloseTo(-8, 5);
	});

	it('rejects incomplete matrix data', () => {
		expect(faceRotationDegrees([1, 0, 0])).toBeNull();
	});
});
