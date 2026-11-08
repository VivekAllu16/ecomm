const host = $('#cart-items');

if (requireLogin()) {
    load();

    host.onclick = async e => {
        const t = e.target;

        try {
            // Update Cart Item Quantity
            if (t.dataset.d) {
                const q = +t.dataset.q + +t.dataset.d;

                if (q < 1) return;

                await api(
                    `/api/cart/updateItem/${t.dataset.id}?quantity=${q}`,
                    { method: 'PUT' }
                );

                load();
            }

            // Remove Cart Item
            if (t.dataset.rm) {
                await api(
                    '/api/cart/' + t.dataset.rm,
                    { method: 'DELETE' }
                );

                load();
            }

        } catch (x) {
            toast(x.message);
        }
    };
}

// Load Cart Items
async function load() {
    try {
        const c = await api('/api/cart/view');
        const n = c.items.length;

        // Render Cart Items
        host.innerHTML = n
            ? c.items.map(i => `
                <article class="cart-row">

                    <div class="cart-product-image">
                        <img
                            src="${img(i.imageUrl)}"
                            alt=""
                            onerror="this.src='images/placeholder.png'"
                        >
                    </div>

                    <div class="cart-product-details">

                        <h3>
                            <a href="product.html?id=${i.productId}">
                                ${esc(i.productName)}
                            </a>
                        </h3>

                        <span class="price">
                            ${money(i.price)}
                        </span>

                        <div class="quantity-controls">

                            <button
                                data-d="-1"
                                data-id="${i.cartItemId}"
                                data-q="${i.quantity}"
                            >
                                −
                            </button>

                            <span>${i.quantity}</span>

                            <button
                                data-d="1"
                                data-id="${i.cartItemId}"
                                data-q="${i.quantity}"
                            >
                                ＋
                            </button>

                            <button
                                class="remove-btn"
                                data-rm="${i.cartItemId}"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                    <b>${money(i.subtotal)}</b>

                </article>
            `).join('')

            // Empty Cart State
            : `
                <section class="panel empty-state">

                    <div class="empty-emoji">🛍️</div>

                    <h2>Your cart is empty</h2>

                    <p class="muted">
                        Looks like you haven't added anything yet.
                    </p>

                    <a class="btn primary" href="shop.html">
                        Start shopping
                    </a>

                </section>
            `;

        // Calculate Delivery Charges
        const del = n
            ? (
                c.totalAmount >= CONFIG.FREE_DELIVERY_ABOVE
                    ? 0
                    : CONFIG.DELIVERY_CHARGE
            )
            : 0;

        // Update Order Summary
        $('#cart-subtotal').textContent = money(c.totalAmount);

        $('#delivery-cost').textContent = n
            ? (del ? money(del) : 'Free')
            : '—';

        $('#cart-total').textContent = money(c.totalAmount + del);

        // Checkout Button
        $('#checkout-btn').disabled = !n;

        $('#checkout-btn').onclick = () => {
            location.href = 'checkout.html';
        };

        // Update Cart Count
        cartCount();

    } catch (x) {
        host.innerHTML = `
            <p class="muted">
                ${esc(x.message)}
            </p>
        `;
    }
}