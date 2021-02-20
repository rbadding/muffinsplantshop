import React, { useEffect, useState } from 'react';
import numeral from 'numeral';
import { useCartContext } from '../../../wrap-with-provider';
import { cartQuantityTotal, cartAmountTotal } from '../../selectors/cartQuantity';
import styles from './checkout-summary.module.css';
// "react-toastify": "^7.0.3",
// import 'react-toastify/dist/ReactToastify.css';
// import '../../styles/ReactToastify.css';

const CheckoutSummary = ({ shippingValues }) => {
    console.log('CheckoutSummary....')
    const { cart, cartDispatch } = useCartContext();
    const [showItems, setShowItems] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');

    const [cartSummary, setCartSummary] = useState({
        quantity: cartQuantityTotal(cart),
        subtotal: cartAmountTotal(cart),
        tax: 0,
        shipping: 0,
        total: 0
    });

    const [cartQuantityFormatted, setCartQuantityFormatted] = useState(`${cartSummary.quantity} item${cartSummary.quantity > 1 ? 's' : ''}`);
    const [cartTotalFormatted, setCartTotalFormatted] = useState(numeral(cartSummary.total).format('$0,0.00'));
    const [summaryText, setSummaryText] = useState(`${cartQuantityFormatted} ${!showItems ? (`${cartTotalFormatted} ${!shippingValues ? '+ tax and shipping' : ''}`) : ''}`);

    useEffect(() => {
        if (cart.length === 0) return;
        setError('');

        const items = cart.map(item => (
            {
                sku: item.sku,
                variant: item.variant,
                quantity: item.quantity
            }
        ))

        const shipping = shippingValues && shippingValues.shipping;
        const state = shippingValues && shippingValues.provinceTerritory;

        window
            .fetch("/.netlify/functions/checkout-summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items,
                    shipping,
                    state
                })
            })
            .then(res => {
                return new Promise((accept, reject) => {
                    res.json().then((json) => {
                        accept({
                            status: res.status,
                            json
                        })
                    })
                });
            })
            .then(data => {
                if (data.status === 200) {
                    let quantitiesChanged = false;

                    // Update cart if quantities have changed
                    cart.forEach((cartItem) => {
                        const item = data.json.cartSummary.items.find((item) => item.variant.id === cartItem.variant.id);

                        if (item && item.quantity !== cartItem.quantity) {
                            quantitiesChanged = true;

                            cartDispatch({
                                type: 'UPDATE_QUANTITY',
                                product: cartItem,
                                quantity: item.quantity > 0 ? item.quantity : 0
                            });                        
                        }
                    })

                    // Notify the user if quantities have changed
                    if (quantitiesChanged) {
                        // toast.info("The quantities in the cart changed due to availability - please check what changed!");
                        console.log('setError..');
                        setWarning("The quantities in the cart have changed due to availability!");
                    }

                    setCartSummary((cartSummary) => {
                        const updated = {
                            quantity: cartQuantityTotal(data.json.cartSummary.items) || cartSummary.quantity,
                            subtotal: typeof data.json.cartSummary.subtotal === 'number' ? data.json.cartSummary.subtotal / 100 : cartSummary.subtotal,
                            tax: typeof data.json.cartSummary.tax === 'number' ? data.json.cartSummary.tax / 100 : cartSummary.tax,
                            shipping: typeof data.json.cartSummary.shipping === 'number' ? data.json.cartSummary.shipping / 100 : cartSummary.shipping
                        };

                        updated.total = updated.subtotal + updated.tax + updated.shipping;

                        setCartTotalFormatted(numeral(updated.total).format('$0,0.00'));

                        setCartQuantityFormatted(`${updated.quantity} item${updated.quantity > 1 ? 's' : ''}`);

                        setCartTotalFormatted(cartTotalFormatted => {
                            setCartQuantityFormatted(cartQuantityFormatted => {
                                setSummaryText(`${cartQuantityFormatted} ${!showItems ? (`${cartTotalFormatted} ${!shippingValues ? '+ tax and shipping' : ''}`) : ''}`);
                                return cartQuantityFormatted;
                            })

                            return cartTotalFormatted;
                        })                        

                        return updated;
                    })
                }
                else {
                    throw new Error("Response status: " + data.status + " (" + data.json.error + ")")
                }

            })
            .catch(err => {
                setError(err.toString());
            });
    }, [shippingValues, cart, cartDispatch, showItems]);

    return (
        <div style={{ padding: `0 1rem`, width: `100%` }}>

            {error && 
                <div className="error">{error}</div>
            }

            {warning && 
                <div className="warning">{warning}</div>
            }

            <h3 className={styles.cart__summary_header}>Summary</h3>
            <div className={styles.cart__summary}>
                <button
                    className={showItems ? styles.open : ''}
                    onClick={() => setShowItems(!showItems)}
                    type="button">
                    &#9654;
                </button>
                <p>{summaryText}</p>
            </div>

            <div className={`${styles.products} ${showItems ? styles.products_show : ''}`}>
                {cart.map(product => (
                    <div key={product.variant.id} className={styles.product}>
                        <img
                            alt=""
                            className={styles.product__image}
                            src={product.imageSrc} />
                        <div className={styles.product__details}>
                            <p>{product.title} - {product.size}</p>
                            <p className={styles.product__quantity}>Qty: {product.quantity}</p>
                            <p className={styles.product__price}>{numeral(product.price).format('$0,0.00')}</p>
                        </div>
                    </div>
                ))}
                <div className={styles.order__summary__top}>
                    <p className={styles.order__summary}>
                        <span>Subtotal</span>
                        <span>{numeral(cartSummary.subtotal).format('$0,0.00')}</span>
                    </p>
                    <p className={styles.order__summary}>
                        <span>Shipping</span>
                        <span>{shippingValues ? numeral(cartSummary.shipping).format('$0,0.00') : '--'}</span></p>
                    <p className={styles.order__summary}>
                        <span>Taxes</span>
                        <span>{shippingValues ? numeral(cartSummary.tax).format('$0,0.00') : '--'}</span>
                    </p>
                </div>

                <p className={styles.order__summary}>{shippingValues ?
                    (<>
                        <span>Total</span>
                        <span>{cartTotalFormatted}</span>
                    </>) :
                    (<span className={styles.order__message}>Complete and submit shipping information for tax and shipping amounts</span>)}
                </p>
            </div>
        </div>
    )
}

export { CheckoutSummary as default };