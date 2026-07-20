import { describe, expect, it } from 'vitest';
import { inspectPageDataSource, pageDataUrlFor } from './source';

describe('Redocly page-data discovery', () => {
	it('maps root and version pages to the bundled OpenAPI definition', () => {
		expect(pageDataUrlFor('https://docs.perfectcorp.com/reference/ai_video_face_swap/v1.0')).toBe(
			'https://docs.perfectcorp.com/page-data/reference/ai_video_face_swap/v1.0/data.json'
		);

		const inspection = inspectPageDataSource({
			url: 'https://docs.perfectcorp.com/page-data/reference/ai_video_face_swap/v1.0/data.json',
			contentType: 'application/json',
			fromCache: false,
			body: JSON.stringify({
				slug: '/reference/ai_video_face_swap/v1.0',
				props: {
					definitionId: 'reference/ai_video_face_swap.yaml',
					baseSlug: '/reference/ai_video_face_swap',
					seo: { title: 'V1.0' },
					metadata: { subType: 'openapi-operation' }
				}
			})
		});

		expect(inspection?.openApiUrls).toEqual([
			'https://docs.perfectcorp.com/_bundle/reference/ai_video_face_swap.yaml'
		]);
		expect(inspection?.pageDataUrls).toEqual([
			'https://docs.perfectcorp.com/page-data/reference/ai_video_face_swap/data.json'
		]);
	});
});
