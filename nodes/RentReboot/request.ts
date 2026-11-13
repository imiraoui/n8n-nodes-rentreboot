import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';

export interface RequestPlan {
	options: IHttpRequestOptions;
	rpc: boolean;
	binaryProperty?: string;
}

function required(p: IDataObject, key: string): string {
	const value = String(p[key] ?? '').trim();
	if (!value) throw new Error(`${key} is required`);
	return value;
}

function bounded(p: IDataObject, key: string, fallback: number, min: number, max: number): number {
	const value = Number(p[key] ?? fallback);
	if (!Number.isInteger(value) || value < min || value > max)
		throw new Error(`${key} must be an integer between ${min} and ${max}`);
	return value;
}

function pick(p: IDataObject, keys: string[]): IDataObject {
	return Object.fromEntries(
		keys
			.filter((key) => p[key] !== '' && p[key] !== undefined && p[key] !== null)
			.map((key) => [key, p[key]]),
	);
}

function enumValue(p: IDataObject, key: string, allowed: string[], fallback: string): string {
	const value = String(p[key] ?? fallback);
	if (!allowed.includes(value)) throw new Error(`Invalid ${key}`);
	return value;
}

export function buildRequest(base: string, operation: string, p: IDataObject): RequestPlan {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: base,
		json: true,
		timeout: 120000,
		disableFollowRedirect: true,
		headers: { Accept: 'application/json' },
	};
	const plan: RequestPlan = { options, rpc: false };
	let body: IDataObject = {};
	{
		plan.rpc = true;
		options.headers = {
			Accept: 'application/json, text/event-stream',
			'MCP-Protocol-Version': '2025-03-26',
		};
		let tool = '';
		let args: IDataObject = {};
		{
			const tools: Record<string, string> = {
				searchGuides: 'search_guides',
				getGuide: 'get_guide',
				listNeighborhoods: 'list_neighborhoods',
				getRentData: 'get_rent_data',
			};
			tool = tools[operation];
			if (!tool) throw new Error('Unknown RentReboot operation');
			if (operation === 'searchGuides')
				args = { query: required(p, 'query'), limit: bounded(p, 'guideLimit', 5, 1, 10) };
			if (operation === 'getGuide') {
				const slug = required(p, 'slug');
				if (!/^[a-z0-9-]{1,120}$/.test(slug)) throw new Error('Invalid guide slug');
				args.slug = slug;
			}
			if (operation === 'listNeighborhoods')
				args = { ...pick(p, ['query']), limit: bounded(p, 'limit', 50, 1, 100) };
			if (operation === 'getRentData') {
				args = {
					area: required(p, 'area'),
					category: enumValue(p, 'category', ['all', 'likely', 'verified'], 'all'),
				};
				if (p.bedrooms !== undefined && p.bedrooms !== 'all')
					args.bedrooms = bounded(p, 'bedrooms', 0, 0, 6);
			}
		}
		body = { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: tool, arguments: args } };
	}
	options.body = body;
	return plan;
}

export function unwrapResponse(response: unknown, rpc: boolean): IDataObject {
	if (!rpc)
		return Array.isArray(response)
			? { results: response }
			: response && typeof response === 'object'
				? (response as IDataObject)
				: { data: response as string };
	const envelope = response as {
		error?: { message?: string };
		result?: {
			isError?: boolean;
			structuredContent?: IDataObject;
			content?: Array<{ type: string; text?: string }>;
		};
	};
	if (envelope.error) throw new Error(envelope.error.message || 'Remote procedure call failed');
	if (!envelope.result) throw new Error('The API returned an invalid MCP response');
	const result = envelope.result;
	const text = (result.content ?? [])
		.filter((c) => c.type === 'text')
		.map((c) => c.text ?? '')
		.join('\n');
	if (result.isError) throw new Error(text || 'The API tool failed');
	if (result.structuredContent) return result.structuredContent;
	try {
		const parsed: unknown = JSON.parse(text);
		return Array.isArray(parsed)
			? { results: parsed }
			: parsed && typeof parsed === 'object'
				? (parsed as IDataObject)
				: { data: parsed as string };
	} catch {
		return { text };
	}
}
