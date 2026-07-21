import { describe, expect, it } from 'vitest';
import { calculateCoverCrop } from './capture';

describe('calculateCoverCrop', () => {
	it('crops a wide camera frame from both sides', () => {
		expect(calculateCoverCrop(1920, 1080, 1080, 1350)).toEqual({
			sx: 528,
			sy: 0,
			sWidth: 864,
			sHeight: 1080
		});
	});

	it('crops a tall source from the top and bottom', () => {
		expect(calculateCoverCrop(800, 1200, 1000, 1000)).toEqual({
			sx: 0,
			sy: 200,
			sWidth: 800,
			sHeight: 800
		});
	});
});
