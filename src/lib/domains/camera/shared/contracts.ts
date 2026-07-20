export type QualityLevel = 'good' | 'warning' | 'unknown';

export type CameraMessageKey =
	| 'preparing'
	| 'lookAhead'
	| 'brighterLight'
	| 'centerFace'
	| 'almostReady'
	| 'readyCapture'
	| 'adjustDistance'
	| 'moveCenter'
	| 'headLevel'
	| 'simplifyBackground';

export type CameraQuality = {
	face: QualityLevel;
	position: QualityLevel;
	lighting: QualityLevel;
	background: QualityLevel;
	brightness: number;
	messageKey: CameraMessageKey;
};
