import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout/layout';
import SEO from '../components/seo';
import ProductItem from '../components/product-item/product-item';
import productSelector from '../selectors/products';
import { minPrice as _minPrice } from '../helpers/helpers';
import styles from './styles/shop.module.css';
import '../styles/react-tabs-custom.css';

const Shop = ({ data, location }) => {
    const [varietiesFilter] = useState([]);
    const filteredProducts = productSelector(data.aamu.ProductCollection, { varietiesFilter });

    return (
        <Layout location={location}>
            <SEO title="Shop" />
            <div className="content-container">
                <h2 className="heading-first">Shop</h2>
            </div>
            <div className="content-container">
                <div className={styles.shop__productGrid}>
                    {filteredProducts.map((product) => {
                        return (
                            <ProductItem
                                key={product.id}
                                product={{
                                    slug: product.slug,
                                    fluid: product.image.image.childImageSharp.fluid,
                                    title: product.title,
                                    category: product.category,
                                    minPrice: _minPrice(product.variants)
                                }}
                            />
                        )
                    })}
                </div>
            </div>
        </Layout>
    )
}

const query = graphql`
  query {
    aamu {
        CategoryCollection {
          id
          created
          updated
          title
        }
        ProductCollection {
          id
          slug
          created
          updated
          title
          description
          image {
            url
            image {
              id
              childImageSharp {
                id
                fluid {
                  base64
                  tracedSVG
                  srcWebp
                  srcSetWebp
                  originalImg
                  originalName
                  presentationWidth
                  presentationHeight
                  aspectRatio
                  src
                  srcSet
                  sizes
                }
              }
            }            
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
`

export { query, Shop as default }