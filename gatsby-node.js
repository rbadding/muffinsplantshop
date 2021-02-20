const path = require(`path`);
const slugify = require('slug');
const remark = require('remark')
const remark_html = require('remark-html')
const { createFilePath } = require(`gatsby-source-filesystem`);
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions;

    if (node.internal.type === 'SitePage' && node.context) {
        // console.log(node);
        createNodeField({
            node,
            name: `slug`,
            value: `/${node.context.categorySlug}/${node.context.slug}`,
        })
    }
}

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;
    const result = await graphql(`
    {
      aamu {
        ProductCollection {
            id
            slug
            created
            updated
            title
            description
            sku
            image {
                url
            }
            variants {
                id
                created
                updated
                title
                price
                variantOf
                available
            }
            category {
                id
                slug
                created
                updated
                title
            }
            plantCare {
                id
                created
                updated
                light
                water
                careOf
            }
        }
      }
    }
    `)

    const products = result.data.aamu.ProductCollection || [];
    
    products.forEach((node) => {
        const categorySlug = slugify(node.category.title);
        createPage({
            path: node.category.slug+'/'+node.slug,
            component: path.resolve(`./src/templates/product.js`),
            context: {
                slug: node.slug,
                categorySlug
            }
        })
    })
}


exports.createResolvers = (
  {
    actions,
    cache,
    createNodeId,
    createResolvers,
    store,
    reporter,
  },
) => {
  const { createNode } = actions;

  createResolvers({

    // Turn Aamu_Product.description from Markdown into html
    Aamu_Product: {
      description: {
        type: 'String',
        resolve(source, args, context, info) {
          const file = remark()
            .use(remark_html)
            .processSync(source.description);

          return String(file);
        }
      }
    },

    // Handle images
    Aamu_GraphQLMediaItem: {
      image: {
        type: `File`,
        resolve(source, args, context, info) {
          return createRemoteFileNode({
            url: source.url,
            store,
            cache,
            createNode,
            createNodeId,
            reporter,
          })
        },
      }
    }

  });
}