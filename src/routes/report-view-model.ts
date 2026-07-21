import type { AnalysisResult } from '$lib/domains/analysis/shared/public';
import type { CameraQuality, QualityLevel } from '$lib/domains/camera/shared/public';
import type { AppCopy } from '$lib/i18n/messages';

type ReportCopy = AppCopy['report'];

export type AppearanceInsight = {
	key: 'condition' | 'tone' | 'balance' | 'lighting';
	label: string;
	source: string;
	score: number;
	summary: string;
	insight: string;
};

export function calculateReadinessScore(quality: CameraQuality) {
	return Math.round(
		(quality.face === 'good' ? 28 : quality.face === 'warning' ? 10 : 16) +
			(quality.position === 'good' ? 28 : quality.position === 'warning' ? 10 : 15) +
			(quality.lighting === 'good' ? 24 : quality.lighting === 'warning' ? 8 : 13) +
			(quality.background === 'good' ? 20 : quality.background === 'warning' ? 7 : 11)
	);
}

export function isCaptureReady(quality: CameraQuality) {
	return quality.face === 'good' && quality.position === 'good' && quality.lighting === 'good';
}

export function calculateExpectedGain(result: AnalysisResult | null) {
	if (!result) return 0;
	const totalImpact = result.guidance.reduce((total, item) => total + item.expectedImpact, 0);
	return Math.min(15, Math.max(4, Math.round(totalImpact * 0.55)));
}

export function calculateProjectedScore(result: AnalysisResult | null, expectedGain: number) {
	return result ? Math.min(96, result.overallScore + expectedGain) : 0;
}

export function calculateComparisonGain(
	result: AnalysisResult | null,
	previous: AnalysisResult | null
) {
	return result && previous ? Math.max(0, result.overallScore - previous.overallScore) : 0;
}

export function localizeMetrics(result: AnalysisResult | null, copy: ReportCopy) {
	if (!result) return [];
	const labels = copy.metricLabels as unknown as Record<string, string>;
	return result.metrics.map((item) => ({ ...item, label: labels[item.key] ?? item.label }));
}

export function localizeGuidance(result: AnalysisResult | null, copy: ReportCopy) {
	if (!result) return [];
	const guidance = copy.guidance as unknown as Record<
		string,
		{ title: string; description: string }
	>;
	return result.guidance.map((item) => ({
		...item,
		title: guidance[item.id]?.title ?? item.title,
		description: guidance[item.id]?.description ?? item.description
	}));
}

function qualityScore(level: QualityLevel) {
	return level === 'good' ? 86 : level === 'warning' ? 58 : 70;
}

export function buildAppearanceInsights(
	result: AnalysisResult | null,
	quality: CameraQuality,
	copy: ReportCopy
): AppearanceInsight[] {
	if (!result) return [];
	const score = (key: string, fallback: number) =>
		result.metrics.find((metric) => metric.key === key)?.score ?? fallback;
	const conditionScore = Math.round((score('texture', 70) + score('pore', 75)) / 2);
	const toneScore = score('redness', 74);
	const balanceScore = qualityScore(quality.position);
	const lightingScore = Math.round((score('radiance', 72) + qualityScore(quality.lighting)) / 2);

	return [
		{
			key: 'condition',
			label: copy.appearance.condition.label,
			source: copy.sourceLabels.youcam,
			score: conditionScore,
			summary:
				conditionScore >= 75 ? copy.appearance.condition.good : copy.appearance.condition.attention,
			insight: copy.appearance.condition.insight
		},
		{
			key: 'tone',
			label: copy.appearance.tone.label,
			source: copy.sourceLabels.youcam,
			score: toneScore,
			summary: `${copy.skinTone.undertone} ${copy.undertone}`,
			insight: copy.appearance.tone.insight
		},
		{
			key: 'balance',
			label: copy.appearance.balance.label,
			source: copy.sourceLabels.device,
			score: balanceScore,
			summary:
				balanceScore >= 75 ? copy.appearance.balance.good : copy.appearance.balance.attention,
			insight: copy.appearance.balance.insight
		},
		{
			key: 'lighting',
			label: copy.appearance.lighting.label,
			source: copy.sourceLabels.derived,
			score: lightingScore,
			summary:
				lightingScore >= 75 ? copy.appearance.lighting.good : copy.appearance.lighting.attention,
			insight: copy.appearance.lighting.insight
		}
	];
}
