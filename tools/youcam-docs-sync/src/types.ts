export type JsonObject = Record<string, unknown>;

export type FetchResult = {
	url: string;
	body: string;
	contentType: string;
	fromCache: boolean;
};

export type SupplementalDocument = {
	sourceUrl: string;
	title: string;
	markdown: string;
};

export type SchemaField = {
	name: string;
	type: string;
	required: boolean;
	description: string;
	fields: SchemaField[];
};

export type SchemaSummary = {
	type: string;
	description: string;
	fields: SchemaField[];
};

export type EndpointParameter = {
	name: string;
	location: string;
	required: boolean;
	type: string;
	description: string;
};

export type EndpointBody = {
	contentType: string;
	required: boolean;
	schema: SchemaSummary;
};

export type EndpointResponse = {
	status: string;
	description: string;
	contentTypes: string[];
	schema: SchemaSummary | null;
};

export type Endpoint = {
	method: string;
	path: string;
	summary: string;
	description: string;
	tags: string[];
	security: string[];
	parameters: EndpointParameter[];
	requestBodies: EndpointBody[];
	responses: EndpointResponse[];
};

export type SecurityScheme = {
	name: string;
	type: string;
	scheme: string;
	description: string;
};

export type NormalizedOpenApi = {
	id: string;
	title: string;
	version: string;
	description: string;
	openapiVersion: string;
	sourceUrl: string;
	servers: string[];
	securitySchemes: SecurityScheme[];
	endpoints: Endpoint[];
	supplemental: SupplementalDocument[];
};

export type SourceInspection = {
	url: string;
	openApiUrls: string[];
	pageDataUrls: string[];
	supplemental: SupplementalDocument | null;
};
