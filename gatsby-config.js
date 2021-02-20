const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config-server.js');

require('dotenv').config();

/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  developMiddleware: (app) => {
    app.use(
      '/.netlify/functions/',
      createProxyMiddleware({
        target: 'http://localhost:9000',
        pathRewrite: {
          '/.netlify/functions/': '',
        },
      })
    )
  },
  siteMetadata: {
    title: `Muffin's Plants`,
    description: `A demo e-commerce website built with Gatsby.js`,
    author: `nh_writes`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/products`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content`
      }
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          google: [
            {
              family: `Source Sans Pro`,
              variants: [`300`, `400`, `500`]
            },
            {
              family: `Montserrat`,
              variants: [`400`, `500`]
            },
          ],
        },
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-remark-normalize-paths",
      options: {
          pathFields: ["image"],
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /assets/
        }
      }
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-source-graphql',
      options: {
        // Arbitrary name for the remote schema Query type
        typeName: `Aamu`,
        // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
        fieldName: `aamu`,
        // Url to query from
        url: config.AAMU_ENDPOINT,
        headers: {
          "x-api-key": process.env.AAMU_API_KEY
        },
      }
    }

  ],
}
