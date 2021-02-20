## E-commerce demo with Gatsby.js
A demo for an online plant shop built from the Gatsby `hello-world` boilerplate.

The product inventory comes from [Aamu.app](Aamu.app) via GraphQL.

The original author is [https://github.com/nhuynh1](Nancy), who we want to thank a lot. We at Aamu.app added the GraphQL integration.

## Requirements

- An account at [Aamu.app](Aamu.app).
- A *database* at Aamu.app and an API key to this database.
- A [Stripe](https://stripe.com/) account and a secret key (testing key is OK).

## Installation

- Click "Deploy to Netlify"
- Insert your secret keys
- After Netlify is done building, edit the file `config-client.js` and insert your Stripe public key
- After Netlify is done building again, the everything should work. If not, go through every step to make sure everything was done correctly.

## Live demo hosted on Netlify
[https://aamu-muffinsplantshop.netlify.app/](https://aamu-muffinsplantshop.netlify.app/)

## Payment processing
Card payment via Stripe in testing mode; please use testing card details shown on the form

## Usage on a third party hosting service

You can deploy this on Netlify: 

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/AamuApp/muffinsplantshop)

Deployment to Netlify asks your **Aamu.app API key** and **Stripe Secret key**.

### What I learned by building an online store with Gatsby and Stripe
[Read Nancy's blog post](https://dev.to/nhuynh1/five-things-i-learned-by-building-my-own-shopping-cart-and-checkout-with-gatsby-and-stripe-273k)
