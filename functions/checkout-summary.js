require('dotenv').config();
const cartQuantityTotal = require('../src/selectors/cartQuantity').cartQuantityTotal;
const cartAmountTotal = require('../src/selectors/cartQuantity').cartAmountTotal;
const calculateOrderAmount = require('./calculateOrderAmount.js');

const graphql_request = require('graphql-request');
const GraphQLClient = graphql_request.GraphQLClient;
const gql = graphql_request.gql;
const config = require('../config-server.js');
const shippingInventory = require('./data/shipping.json');
const taxrates = require('./data/taxrates.json');


async function getItemsFromServer(items) {
	const itemsFromServer = [];
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
	`

	for (const item of items) {
		const data = await graphQLClient.request(query, { id: item.variant.id });
		itemsFromServer.push(data);
	}

	return itemsFromServer;
}

module.exports.handler = async (event, context) => {
	try {
		const { items, shipping, state } = JSON.parse(event.body);

		const cartSummary = await calculateOrderAmount(items, shipping, state);

		return {
			statusCode: 200,
			body: JSON.stringify({
				cartSummary
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