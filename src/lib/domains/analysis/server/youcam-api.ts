import { env } from '$env/dynamic/private';

const DEFAULT_API_BASE = 'https://yce-api-01.makeupar.com';
const POLL_INTERVAL_MS = 1_500;
const POLL_TIMEOUT_MS = 55_000;

type JsonObject = Record<string, unknown>;

export type YouCamFeature = {
	version: 'v2.0' | 'v2.1';
	slug: string;
	payload: (fileId: string) => JsonObject;
};

function asObject(value: unknown): JsonObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as JsonObject)
		: {};
}

function getData(value: unknown) {
	return asObject(asObject(value).data);
}

async function apiRequest(path: string, init: RequestInit = {}) {
	const apiKey = env.YOUCAM_API_KEY;
	if (!apiKey) throw new Error('The YouCam API key is not configured.');

	const response = await fetch(`${env.YOUCAM_API_BASE ?? DEFAULT_API_BASE}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
			...init.headers
		}
	});
	const body = (await response.json().catch(() => ({}))) as unknown;
	if (!response.ok) {
		const data = getData(body);
		throw new Error(String(data.error_message ?? data.error ?? `YouCam API ${response.status}`));
	}
	return body;
}

async function uploadForFeature(file: File, feature: YouCamFeature) {
	const metadata = await apiRequest(`/s2s/${feature.version}/file/${feature.slug}`, {
		method: 'POST',
		body: JSON.stringify({
			files: [
				{
					content_type: file.type,
					file_name: file.name || 'presence-capture.jpg',
					file_size: file.size
				}
			]
		})
	});
	const files = getData(metadata).files;
	const firstFile = Array.isArray(files) ? asObject(files[0]) : {};
	const requests = firstFile.requests;
	const uploadRequest = Array.isArray(requests) ? asObject(requests[0]) : asObject(requests);
	const uploadUrl = uploadRequest.url;
	const fileId = firstFile.file_id;
	if (typeof uploadUrl !== 'string' || typeof fileId !== 'string') {
		throw new Error('YouCam did not return a valid upload URL.');
	}

	const uploadHeaders = new Headers();
	for (const [name, value] of Object.entries(asObject(uploadRequest.headers))) {
		if (typeof value === 'string' || typeof value === 'number') {
			uploadHeaders.set(name, String(value));
		}
	}
	if (!uploadHeaders.has('Content-Type')) uploadHeaders.set('Content-Type', file.type);

	const upload = await fetch(uploadUrl, {
		method: typeof uploadRequest.method === 'string' ? uploadRequest.method : 'PUT',
		headers: uploadHeaders,
		body: file
	});
	if (!upload.ok) {
		const detail = (await upload.text().catch(() => '')).trim();
		throw new Error(
			`The image upload failed. (${upload.status})${detail ? ` ${detail.slice(0, 240)}` : ''}`
		);
	}
	return fileId;
}

async function pollTask(feature: YouCamFeature, taskId: string) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
		const response = await apiRequest(
			`/s2s/${feature.version}/task/${feature.slug}/${encodeURIComponent(taskId)}`
		);
		const data = getData(response);
		if (data.task_status === 'success') return data.results;
		if (data.task_status === 'error') {
			throw new Error(
				String(data.error_message ?? data.error ?? 'YouCam could not analyze this image.')
			);
		}
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}
	throw new Error('The analysis is taking longer than expected. Please try again.');
}

export async function runYouCamFeature(file: File, feature: YouCamFeature) {
	const fileId = await uploadForFeature(file, feature);
	const created = await apiRequest(`/s2s/${feature.version}/task/${feature.slug}`, {
		method: 'POST',
		body: JSON.stringify(feature.payload(fileId))
	});
	const taskId = getData(created).task_id;
	if (typeof taskId !== 'string') throw new Error('YouCam did not return a valid task ID.');
	return pollTask(feature, taskId);
}
