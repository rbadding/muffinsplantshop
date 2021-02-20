require('dotenv').config();
import { GraphQLClient, gql } from 'graphql-request'
import config from '../config-server.js';

exports.handler = async (event, context) => {

	try {
		const { items, shipping, state } = JSON.parse(event.body);
		const itemsFromServer = [];
		const updatedQuantities = [];

		const graphQLClient = new GraphQLClient(config.AAMU_ENDPOINT, {
			headers: {
				"x-api-key": process.env.AAMU_API_KEY,
			},
		})

		const query = gql`
			query getVariant($id: ID!) {
				Variant(id: $id) {
					id
					created
					updated
					title
					price
					variantOf
					available
				}
			}
		`;

		const mutation = gql`
			mutation updateQuantity($id: ID!, $available: Float!) {
				Variant(id: $id, available: $available) {
					id
					available
				}
			}
		`;

		// Get current quantities from the server
		for (const item of items) {
			const data = await graphQLClient.request(query, { id: item.variant.id });
			itemsFromServer.push(data);
		}

		// Update quantities
		for (const item of items) {
			const itemFromServer = itemsFromServer.find((item2) => item2.Variant.id === item.variant.id);

			if (itemFromServer) {
				const data = await graphQLClient.request(mutation, { id: item.variant.id, available: itemFromServer.Variant.available - item.quantity });
				updatedQuantities.push(data.Variant);
			}
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				items: updatedQuantities
			})
		};
	}
	catch (error) {
		console.log('Error: ', error.toString());

		return {
			statusCode: 500,
			body: JSON.stringify({ error })
		};		
	}		
}