import { cart, removeFromCart, updateDeliveryOption } from '../../data/cart.js';
import { getProduct} from '../../data/products.js'
import { formatCurrency } from '../utils/money.js'
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';


export function renderOderSummary() {

  let cartSummaryHTML = '';

  document.querySelector('.js-cart-quantity-link').innerHTML = `${cart.length} items`;


  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    
    const matchingProduct = getProduct(productId);


    const deliveryOptionId = cartItem.deliveryOptionId;
    
    const deliveryOption =  getDeliveryOption(deliveryOptionId);

    if (!deliveryOption) {
      console.error(`Delivery option not found for ID: ${deliveryOptionId}`);
      return;
    }

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              $${formatCurrency(matchingProduct.priceCents)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary">
                Update
              </span>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
          </div>

        </div>
      </div>
    `;
  });


  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);
      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.remove();
    });
  });

  document.querySelectorAll('.delivery-option-input').forEach((input) => {
    input.addEventListener('change', () => {
      const productId = input.name.split('-')[2];
      const deliveryOptionId = input.value;

      // Find and update the cart item
      const cartItem = cart.find(item => item.productId === productId);
      if (cartItem) {
        cartItem.deliveryOptionId = deliveryOptionId;
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update the delivery date display
        const deliveryOption = deliveryOptions.find(option => option.id === deliveryOptionId);
        const dateString = dayjs().add(deliveryOption.deliveryDays, 'days').format('dddd, MMMM D');
        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        container.querySelector('.delivery-date').innerHTML = `Delivery date: ${dateString}`;
      }
    });
  });


  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
      const dateString = deliveryDate.format('dddd, MMMM D');
      const priceString = deliveryOption.priceCents === 0
        ? 'FREE'
        : `$${formatCurrency(deliveryOption.priceCents)} -`;

      // We already have cartItem from parameters, no need to find it again
      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option" 
        data-product-id="${matchingProduct.id}" 
        data-delivery-option-id="${deliveryOption.id}">
          <input 
            type="radio" 
            ${isChecked ? 'checked' : ''}
            class="delivery-option-input" 
            name="delivery-option-${matchingProduct.id}"
            value="${deliveryOption.id}"
          >
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>
      `;
    });

    return html;
  }


  document.querySelectorAll('.js-delivery-option')
    .forEach((element) => {
      element.addEventListener('click', () => {
        const { productId, deliveryOptionId } = element.dataset;
        updateDeliveryOption(productId, deliveryOptionId);
        renderOderSummary();
      })
    }
    );

}

