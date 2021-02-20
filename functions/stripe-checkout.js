require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cartQuantityTotal = require('../src/selectors/cartQuantity').cartQuantityTotal;
const cartAmountTotal = require('../src/selectors/cartQuantity').cartAmountTotal;
const shippingInventory = require('./data/shipping.json');
const taxrates = require('./data/taxrates.json');
const calculateOrderAmount = require('./calculateOrderAmount.js');

exports.handler = async (event, context) => {

	if (!process.env.STRIPE_SECRET_KEY) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'No Stripe API key' })
		};		
	}

	try {
		const { items, shipping, state } = JSON.parse(event.body);

		const cartSummary = await calculateOrderAmount(items, shipping, state);

		// const metadata = cartSummary.items.map((item) => item.title + ` (${item.variant.title})` + ': ' + item.quantity)
		const metadata = {};
		cartSummary.items.forEach((item) => metadata[`${item.title} (${item.variant.title})`] = item.quantity);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: cartSummary.total,
			metadata,
			currency: "CAD"
		});

		return {
			statusCode: 200,
			body: JSON.stringify({
				clientSecret: paymentIntent.client_secret
			})
		};
	}
	catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.toString() })
		};		
	}
}