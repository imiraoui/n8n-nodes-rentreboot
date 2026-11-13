import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { properties } from './properties';
import { buildRequest, unwrapResponse } from './request';

export class RentReboot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RentReboot',
		name: 'rentReboot',
		icon: { light: 'file:rentreboot.svg', dark: 'file:rentreboot.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Search NYC renter guides and retrieve neighborhood rent percentiles',
		defaults: { name: 'RentReboot' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],

		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const output: INodeExecutionData[] = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const params: IDataObject = {};
				for (const property of properties) {
					const operations = property.displayOptions?.show?.operation;
					if (property.name !== 'operation' && (!operations || operations.includes(operation)))
						params[property.name] = this.getNodeParameter(
							property.name,
							itemIndex,
							property.default,
						) as IDataObject[string];
				}
				const plan = buildRequest('https://rentreboot.com/api/mcp', operation, params);
				const response = await this.helpers.httpRequest(plan.options);
				output.push({ json: unwrapResponse(response, plan.rpc), pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail())
					output.push({ json: { error: error.message }, pairedItem: { item: itemIndex } });
				else throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}
		return [output];
	}
}
