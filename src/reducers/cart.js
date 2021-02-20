const updateQuantity = (state, product, quantity) => {
    quantity = parseInt(quantity, 10);

    return state.map(_product => {
        if (_product.variant.id === product.variant.id && typeof quantity == 'number') {
            return { ...product, quantity: quantity };
        } else {
            return _product;
        }
    });
}
const addProduct = (state, product) => {
    // console.log(product);
    const foundProduct = state.find(_product => _product.variant.id === product.variant.id);

    if (foundProduct) {
        const quantity = parseInt(foundProduct.quantity, 10) + 1;
        return updateQuantity(state, product, quantity)
    } else {
        return [...state, product];
    }
}

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            return addProduct(state, action.product);
        case 'UPDATE_QUANTITY':
            return updateQuantity(state, action.product, action.quantity);
        case 'REMOVE_FROM_CART':
            return state.filter(_product => _product.variant.id !== action.product.variant.id);
        case 'CLEAR_CART':
            return [];
        case 'SET_CART':
            return action.cart;
        default:
            return state;
    }
}

export { cartReducer as default };