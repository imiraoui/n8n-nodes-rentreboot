import type { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				value: 'getGuide',
				name: 'Get Guide',
				action: 'Get a renter guide',
				description: 'Read a published renter guide',
			},
			{
				value: 'listNeighborhoods',
				name: 'Get Many Neighborhoods',
				action: 'Get many rent neighborhoods',
				description: 'Find neighborhoods with published rent data',
			},
			{
				value: 'getRentData',
				name: 'Get Rent Data',
				action: 'Get neighborhood rent data',
				description: 'Get aggregate asking-rent percentiles',
			},
			{
				value: 'searchGuides',
				name: 'Search Guides',
				action: 'Search renter guides',
				description: 'Search public NYC renter guides',
			},
		],
		default: 'searchGuides',
	},
	{
		displayName: 'Search Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'Keywords to search public renter guides',
		displayOptions: {
			show: {
				operation: ['searchGuides'],
			},
		},
		required: true,
		placeholder: 'security deposit',
	},
	{
		displayName: 'Limit',
		name: 'guideLimit',
		type: 'number',
		default: 5,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				operation: ['searchGuides'],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 10,
		},
	},
	{
		displayName: 'Guide Slug',
		name: 'slug',
		type: 'string',
		default: '',
		description: 'Guide slug returned by Search Guides',
		displayOptions: {
			show: {
				operation: ['getGuide'],
			},
		},
		required: true,
	},
	{
		displayName: 'Search Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'Optional neighborhood name or slug',
		displayOptions: {
			show: {
				operation: ['listNeighborhoods'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				operation: ['listNeighborhoods'],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'Neighborhood',
		name: 'area',
		type: 'string',
		default: '',
		description: 'Published neighborhood name or slug',
		displayOptions: {
			show: {
				operation: ['getRentData'],
			},
		},
		required: true,
		placeholder: 'chelsea',
	},
	{
		displayName: 'Bedrooms',
		name: 'bedrooms',
		type: 'options',
		default: 'all',
		options: [
			{
				name: '1',
				value: '1',
			},
			{
				name: '2',
				value: '2',
			},
			{
				name: '3',
				value: '3',
			},
			{
				name: '4',
				value: '4',
			},
			{
				name: '5',
				value: '5',
			},
			{
				name: '6',
				value: '6',
			},
			{
				name: 'All',
				value: 'all',
			},
			{
				name: 'Studio',
				value: '0',
			},
		],
		displayOptions: {
			show: {
				operation: ['getRentData'],
			},
		},
	},
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		default: 'all',
		options: [
			{
				name: 'All',
				value: 'all',
			},
			{
				name: 'Likely Stabilized',
				value: 'likely',
			},
			{
				name: 'Verified Stabilized',
				value: 'verified',
			},
		],
		displayOptions: {
			show: {
				operation: ['getRentData'],
			},
		},
	},
];
