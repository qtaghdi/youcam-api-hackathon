import { describe, expect, it } from 'vitest';
import { normalizeOpenApi, parseOpenApi } from './openapi';
import { renderFeatureDocument } from './render';

const fixture = `
openapi: 3.0.0
info:
  title: Sample Feature
  description: A readable feature overview.
servers:
  - url: https://api.example.com
components:
  securitySchemes:
    Bearer:
      type: http
      scheme: bearer
  schemas:
    BaseInput:
      type: object
      required: [file_id]
      properties:
        file_id:
          type: string
          description: Uploaded file identifier.
    TaskInput:
      allOf:
        - $ref: '#/components/schemas/BaseInput'
        - type: object
          properties:
            strength:
              type: number
paths:
  /task:
    post:
      tags: [V1.0]
      summary: Create task
      security:
        - Bearer: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskInput'
      responses:
        '200':
          description: Success
`;

describe('OpenAPI normalization', () => {
	it('infers versions and expands composed schema fields', () => {
		const parsed = parseOpenApi(fixture);
		expect(parsed).not.toBeNull();
		const feature = normalizeOpenApi(parsed!, 'https://example.com/sample.yaml');

		expect(feature.version).toBe('V1.0');
		expect(feature.endpoints).toHaveLength(1);
		expect(feature.endpoints[0].requestBodies[0].schema.fields).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'file_id', required: true }),
				expect.objectContaining({ name: 'strength' })
			])
		);

		const markdown = renderFeatureDocument(feature);
		expect(markdown).toContain('| `file_id` | `string` | Yes | Uploaded file identifier. |');
		expect(markdown).toContain('**API version:** V1.0');
	});
});
