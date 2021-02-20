const graphql_request = require('graphql-request');
const GraphQLClient = graphql_request.GraphQLClient;
const gql = graphql_request.gql;
const config = require('../config-server.js');
const shippingInventory = require('./data/shipping.json');
const taxrates = require('./data/taxrates.json');

module.exports = async (items, shipping, state) => {

	if (!process.env.AAMU_API_KEY) {
		throw 'No Aamu API key';
	}

	const itemsFromServer = await getItemsFromServer(items);

	// Remove items that are not available
	items = items.filter((item) => {
		const product = itemsFromServer.find((itemFromServer) => itemFromServer.Variant.id === item.variant.id);

		return !!product;
	})

	// Remove items that are not available
	items = items.map((item) => {
		const product = itemsFromServer.find((itemFromServer) => itemFromServer.Variant.id === item.variant.id);

		item.quantity = Math.min(item.quantity, product.Variant.available);
		return item;
	})

	// Calculate total amount
	const subTotalAmount = items.reduce((total, item) => {
		// get price against inventory
		const product = itemsFromServer.find((itemFromServer) => itemFromServer.Variant.id === item.variant.id);

		return total + (100 * product.Variant.price * (item.quantity > 0 ? item.quantity: 0))
	}, 0);


	// get shipping price against inventory
	const shipMethod = shippingInventory.find((ship_method) => ship_method.shipping_method === shipping);
	const shippingAmount = shipMethod ? 100 * shipMethod.shipping_amount : undefined;

	// get tax rate
	const taxRate = taxrates.find((tax) => tax.state === state);

	// Calculate tax
	const taxAmount = taxRate ? Math.round((subTotalAmount + shippingAmount) * taxRate.total_tax_rate) : undefined;

	return {
		items,
		subtotal: subTotalAmount,
		shipping: shippingAmount,
		tax: taxAmount,
		total: (subTotalAmount || 0) + (shippingAmount || 0) + (taxAmount || 0)
	}
}

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