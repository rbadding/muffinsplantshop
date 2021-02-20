import React, { useState } from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import { useCartContext } from '../../../wrap-with-provider';
import { CartButton, Cart } from '../shopping-cart/shopping-cart';
import styles from './layout.module.css';

// Close the cart when the route changes
// There is probably a better way to do this
let state = 0;

const Layout = ({ children, location, prevLocation }) => {
    const path = location.pathname;
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    title
                }
            }
        }  
    `)

    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const { isOpenCart, setIsOpenCart } = useCartContext();
    
    // Close the cart when the route changes
    // There is probably a better way to do this.
    // Note that this didn't work: https://stackoverflow.com/a/58524372 ... 
    if (location.state && location.state.key && state !== location.state.key) {
        state = location.state.key;
        setIsOpenCart(false);
    }

    return (
        <div id="root" className={`${isOpenCart && styles.layout__cartOpen}`}>
            <header className={styles.layout__header}>
                <div style={{ display: `flex` }} className={styles.layout+' '+styles.layout__headerInner}>
                    {path !== '/checkout' && <button
                        aria-label="Toggle navigation menu"
                        className={styles.layout__menuButton}
                        onClick={() => setIsOpenMenu(!isOpenMenu)}>
                    </button>}
                    <Link to="/">
                        <h1 className={styles.layout__headerText}>
                            {data.site.siteMetadata.title}
                        </h1>
                    </Link>
                    {path !== '/checkout' && <CartButton />}
                </div>
            </header>        
            <div className={styles.layout}>
                {path !== '/checkout' && <div
                    className={`${styles.layout__navigationMenuWrapper} 
                    ${isOpenMenu ? styles.layout__navigationOpen : ''}`}>
                    <ul className={styles.layout__navigationMenu}>
                        <li><Link
                            activeClassName={styles.layout__activeLink}
                            className={styles.layout__navigationMenuItem}
                            to="/shop">Shop</Link></li>
                        <li><Link
                            activeClassName={styles.layout__activeLink}
                            className={styles.layout__navigationMenuItem}
                            to="/about">About</Link></li>
                    </ul>
                </div>}
                {children}
                <footer className={styles.layout__footer}>
                    <div className={styles.layout__footerLinks}>
                        <div>
                            <Link className={styles.layout__footerLink} to="/delivery-info">Delivery Info</Link>
                            <Link className={styles.layout__footerLink} to="/about">About</Link>
                            <a
                                className={styles.layout__footerSocialIcons}
                                href="https://instagram.com">
                                <span className="screen-reader-only">Instagram</span>
                            </a>
                        </div>
                        <p>{data.site.siteMetadata.title} {(new Date()).getFullYear()}</p>
                    </div>
                </footer>
            </div>
            {isOpenCart && (<div className={styles.layout__shoppingCart} style={{ backgroundColor: `white`, position: `fixed`, top: 0, right: 0, width: `100%`, maxWidth: 400, height: `100vh`, boxShadow: `-4px 0px 30px 0px rgba(0,0,0, 0.06)`, overflowY: `auto`, zIndex: 2 }}>
                <Cart />
            </div>)}
        </div>
    );
}

export { Layout as default };