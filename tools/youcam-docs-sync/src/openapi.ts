import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type {
	Endpoint,
	EndpointBody,
	EndpointParameter,
	EndpointResponse,
	JsonObject,
	NormalizedOpenApi,
	SchemaField,
	SchemaSummary,
	SecurityScheme
} from './types';

const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

const openApiShape = z
	.object({
		openapi: z.string().optional(),
		swagger: z.string().optional(),
		info: z
			.object({
				title: z.string().optional(),
				version: z.union([z.string(), z.number()]).optional(),
				description: z.string().optional()
			})
			.passthrough()
			.optional(),
		paths: z.record(z.string(), z.unknown())
	})
	.passthrough()
	.refine((value) => Boolean(value.openapi || value.swagger), {
		message: 'Not an OpenAPI document'
	});

function asObject(value: unknown): JsonObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as JsonObject)
		: {};
}

function asArray(value: unknown) {
	return Array.isArray(value) ? value : [];
}

function cleanText(value: unknown) {
	return typeof value === 'string'
		? value
				.replace(/\r\n/g, '\n')
				.replace(/[ \t]+\n/g, '\n')
				.trim()
		: '';
}

function slugify(value: string) {
	return (
		value
			.toLowerCase()
			.replace(/&/g, ' and ')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'youcam-api'
	);
}

function decodePointerPart(value: string) {
	return decodeURIComponent(value).replace(/~1/g, '/').replace(/~0/g, '~');
}

function resolveReference(root: JsonObject, value: unknown): unknown {
	const object = asObject(value);
	const reference = object.$ref;
	if (typeof reference !== 'string' || !reference.startsWith('#/')) return value;
	let current: unknown = root;
	for (const part of reference.slice(2).split('/').map(decodePointerPart)) {
		current = asObject(current)[part];
	}
	return current ?? value;
}

function referenceName(value: unknown) {
	const reference = asObject(value).$ref;
	return typeof reference === 'string' ? (reference.split('/').at(-1) ?? '') : '';
}

function schemaType(schemaValue: unknown, root: JsonObject): string {
	const original = asObject(schemaValue);
	const reference = referenceName(original);
	const schema = asObject(resolveReference(root, schemaValue));
	const nullable = schema.nullable === true ? ' | null' : '';

	const composition = ['oneOf', 'anyOf', 'allOf'].find((key) => Array.isArray(schema[key]));
	if (composition) {
		const variants = asArray(schema[composition])
			.map((entry) => schemaType(entry, root))
			.filter(Boolean);
		return `${variants.join(composition === 'allOf' ? ' & ' : ' | ')}${nullable}`;
	}

	const type = typeof schema.type === 'string' ? schema.type : reference || 'object';
	if (type === 'array') return `array<${schemaType(schema.items, root)}>${nullable}`;
	const format = typeof schema.format === 'string' ? ` (${schema.format})` : '';
	const values = asArray(schema.enum);
	const enumeration = values.length ? ` — ${values.map(String).join(' | ')}` : '';
	return `${reference || type}${format}${enumeration}${nullable}`;
}

function schemaFields(
	schemaValue: unknown,
	root: JsonObject,
	depth = 0,
	seen = new Set<string>()
): SchemaField[] {
	if (depth > 2) return [];
	const reference = referenceName(schemaValue);
	if (reference && seen.has(reference)) return [];
	const nextSeen = new Set(seen);
	if (reference) nextSeen.add(reference);

	const schema = asObject(resolveReference(root, schemaValue));
	if (schema.type === 'array' || schema.items) {
		return schemaFields(schema.items, root, depth, nextSeen);
	}
	const composition = ['allOf', 'oneOf', 'anyOf'].find((key) => Array.isArray(schema[key]));
	if (composition) {
		const fields = asArray(schema[composition]).flatMap((entry) =>
			schemaFields(entry, root, depth, nextSeen)
		);
		return [...new Map(fields.map((field) => [`${field.name}:${field.type}`, field])).values()];
	}

	const properties = asObject(schema.properties);
	const required = new Set(asArray(schema.required).map(String));
	return Object.entries(properties).map(([name, property]) => {
		const resolved = asObject(resolveReference(root, property));
		return {
			name,
			type: schemaType(property, root),
			required: required.has(name),
			description: cleanText(resolved.description),
			fields: schemaFields(property, root, depth + 1, nextSeen)
		};
	});
}

function summarizeSchema(schemaValue: unknown, root: JsonObject): SchemaSummary {
	const schema = asObject(resolveReference(root, schemaValue));
	return {
		type: schemaType(schemaValue, root),
		description: cleanText(schema.description),
		fields: schemaFields(schemaValue, root)
	};
}

function normalizeParameters(
	pathParameters: unknown,
	operationParameters: unknown,
	root: JsonObject
): EndpointParameter[] {
	const merged = [...asArray(pathParameters), ...asArray(operationParameters)];
	const unique = new Map<string, EndpointParameter>();
	for (const parameterValue of merged) {
		const parameter = asObject(resolveReference(root, parameterValue));
		const name = String(parameter.name ?? '');
		const location = String(parameter.in ?? '');
		if (!name || !location) continue;
		const schema = parameter.schema;
		unique.set(`${location}:${name}`, {
			name,
			location,
			required: parameter.required === true || location === 'path',
			type: schemaType(schema, root),
			description: cleanText(parameter.description)
		});
	}
	return [...unique.values()];
}

function normalizeRequestBodies(operation: JsonObject, root: JsonObject): EndpointBody[] {
	const body = asObject(resolveReference(root, operation.requestBody));
	const required = body.required === true;
	return Object.entries(asObject(body.content)).map(([contentType, mediaValue]) => {
		const media = asObject(mediaValue);
		return {
			contentType,
			required,
			schema: summarizeSchema(media.schema, root)
		};
	});
}

function normalizeResponses(operation: JsonObject, root: JsonObject): EndpointResponse[] {
	return Object.entries(asObject(operation.responses)).map(([status, responseValue]) => {
		const response = asObject(resolveReference(root, responseValue));
		const content = asObject(response.content);
		const firstMedia = Object.values(content)[0];
		const schema = firstMedia ? asObject(firstMedia).schema : null;
		return {
			status,
			description: cleanText(response.description),
			contentTypes: Object.keys(content),
			schema: schema ? summarizeSchema(schema, root) : null
		};
	});
}

function securityNames(value: unknown, fallback: unknown) {
	const security = Array.isArray(value) ? value : asArray(fallback);
	return [...new Set(security.flatMap((entry) => Object.keys(asObject(entry))))];
}

function normalizeEndpoints(root: JsonObject): Endpoint[] {
	const endpoints: Endpoint[] = [];
	const globalSecurity = root.security;
	for (const [endpointPath, pathValue] of Object.entries(asObject(root.paths))) {
		const pathItem = asObject(resolveReference(root, pathValue));
		for (const method of httpMethods) {
			if (!pathItem[method]) continue;
			const operation = asObject(pathItem[method]);
			endpoints.push({
				method: method.toUpperCase(),
				path: endpointPath,
				summary: cleanText(operation.summary) || `${method.toUpperCase()} ${endpointPath}`,
				description: cleanText(operation.description),
				tags: asArray(operation.tags).map(String),
				security: securityNames(operation.security, globalSecurity),
				parameters: normalizeParameters(pathItem.parameters, operation.parameters, root),
				requestBodies: normalizeRequestBodies(operation, root),
				responses: normalizeResponses(operation, root)
			});
		}
	}
	return endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
}

function normalizeSecuritySchemes(root: JsonObject): SecurityScheme[] {
	const components = asObject(root.components);
	const schemes = asObject(components.securitySchemes);
	return Object.entries(schemes).map(([name, schemeValue]) => {
		const scheme = asObject(resolveReference(root, schemeValue));
		return {
			name,
			type: String(scheme.type ?? ''),
			scheme: String(scheme.scheme ?? scheme.in ?? ''),
			description: cleanText(scheme.description)
		};
	});
}

export function parseOpenApi(text: string): JsonObject | null {
	try {
		const parsed = parseYaml(text) as unknown;
		const validated = openApiShape.safeParse(parsed);
		return validated.success ? (validated.data as JsonObject) : null;
	} catch {
		return null;
	}
}

export function normalizeOpenApi(root: JsonObject, sourceUrl: string): NormalizedOpenApi {
	const info = asObject(root.info);
	const title = cleanText(info.title) || 'YouCam API';
	const endpoints = normalizeEndpoints(root);
	const inferredVersions = [
		...new Set(
			endpoints.flatMap((endpoint) => endpoint.tags).filter((tag) => /^v\d+(?:\.\d+)*$/i.test(tag))
		)
	];
	const declaredVersion =
		typeof info.version === 'string' || typeof info.version === 'number'
			? String(info.version).trim()
			: '';
	const servers = asArray(root.servers)
		.map((server) => String(asObject(server).url ?? ''))
		.filter(Boolean);
	return {
		id: slugify(title),
		title,
		version: declaredVersion || inferredVersions.join(', '),
		description: cleanText(info.description),
		openapiVersion: String(root.openapi ?? root.swagger ?? ''),
		sourceUrl,
		servers,
		securitySchemes: normalizeSecuritySchemes(root),
		endpoints,
		supplemental: []
	};
}
