let addrId = null;

const P = new URLSearchParams(location.search);

// Check Login and Determine Checkout Flow
if (requireLogin()) {
    P.get('transactionId') || P.get('status')
        ? finish()
        : init();
}

// Return URL After Payment
const retUrl = () => location.origin + location.pathname;


// Initialize Checkout
async function init() {
    try {
        const [a, c] = await Promise.all([
            api('/api/address/get'),
            api('/api/cart/view')
        ]);

        // Check for Empty Cart
        if (!c.items.length) {
            $('#co').innerHTML = `
                <section class="panel empty-state">
                    <div class="empty-emoji">🛍️</div>
                    <h2>Your cart is empty</h2>
                    <a class="btn primary" href="shop.html">
                        Continue shopping
                    </a>
                </section>
            `;
            return;
        }

        // Select Primary Address or First Available Address
        addrId = (a.find(x => x.isPrimary) || a[0] || {}).id;

        // Calculate Delivery Charges
        const del = c.totalAmount >= CONFIG.FREE_DELIVERY_ABOVE
            ? 0
            : CONFIG.DELIVERY_CHARGE;

        // Render Checkout Content
        $('#co').innerHTML = `
            <div class="cart-layout">

                <div>

                    <!-- Delivery Address -->
                    <section class="panel co-block">

                        <h2>Delivery address</h2>

                        <p class="muted">
                            Choose where we should deliver.
                        </p>

                        ${a.map(x => `
                            <label class="addr-opt ${x.id === addrId ? 'sel' : ''}">

                                <input
                                    type="radio"
                                    name="ad"
                                    value="${x.id}"
                                    ${x.id === addrId ? 'checked' : ''}
                                >

                                <div>
                                    <b>
                                        ${esc(x.houseNo)}, ${esc(x.streetName)}
                                    </b>

                                    ${x.isPrimary
                                        ? ' <span class="default-address">✓ Primary</span>'
                                        : ''
                                    }

                                    <br>

                                    ${esc(x.city)}, ${esc(x.state)}, ${esc(x.country)} – ${esc(x.pincode)}
                                </div>

                            </label>
                        `).join('')}

                        <a
                            class="btn outline"
                            style="margin-top: 14px;"
                            href="profile.html#address"
                        >
                            ＋ Add new address
                        </a>

                    </section>

                    <!-- Order Details -->
                    <section class="panel co-block">

                        <h2>Order details</h2>

                        <p class="muted">
                            Review your products.
                        </p>

                        <div class="cart-items" style="margin-top: 12px;">

                            ${c.items.map(i => `
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
                                            ${esc(i.productName)}
                                        </h3>

                                        <span class="muted">
                                            Qty ${i.quantity} × ${money(i.price)}
                                        </span>

                                    </div>

                                    <b>${money(i.subtotal)}</b>

                                </article>
                            `).join('')}

                        </div>

                    </section>

                </div>

                <!-- Price Summary -->
                <aside class="panel order-summary">

                    <h2>Price details</h2>

                    <div class="summary-line">
                        <span>Items (${c.totalItems})</span>
                        <b>${money(c.totalAmount)}</b>
                    </div>

                    <div class="summary-line">
                        <span>Delivery charges</span>
                        <b>${del ? money(del) : 'Free'}</b>
                    </div>

                    <div class="summary-line total">
                        <span>Amount payable</span>
                        <b>${money(c.totalAmount + del)}</b>
                    </div>

                    <p class="form-message" id="m"></p>

                    <button
                        class="btn primary full"
                        id="pay"
                        ${addrId ? '' : 'disabled'}
                    >
                        Proceed to payment
                    </button>

                </aside>

            </div>
        `;

        // Handle Address Selection
        document.querySelectorAll('input[name=ad]').forEach(r => {
            r.onchange = () => {
                addrId = +r.value;

                document.querySelectorAll('.addr-opt').forEach(l => {
                    l.classList.toggle('sel', l.contains(r));
                });
            };
        });

        // Payment Button
        $('#pay').onclick = pay;

    } catch (x) {
        $('#co').innerHTML = `
            <p class="muted">
                ${esc(x.message)}
            </p>
        `;
    }
}


// Place Order and Redirect to Payment Gateway
async function pay() {
    const b = $('#pay');

    b.disabled = true;
    b.textContent = 'Creating order…';

    try {
        const o = await api('/api/orders/place', {
            method: 'POST',
            body: {
                addressId: addrId
            }
        });

        const u = JSON.parse(
            localStorage.getItem('user') || '{}'
        );

        /*
         * Payment site should redirect back to:
         * checkout.html?orderId=..&transactionId=..&status=SUCCESS|FAILED
         */

        const q = new URLSearchParams({
            orderId: o.orderId,
            orderNo: o.orderNo,
            amount: o.amount,
            userId: u.id || '',
            applicationType: 'ECOMMERCE',
            returnUrl: retUrl()
        });

        location.href = CONFIG.PAYMENT_URL + '?' + q;

    } catch (x) {
        showMsg($('#m'), x.message);

        b.disabled = false;
        b.textContent = 'Proceed to payment';
    }
}


// Handle Payment Gateway Return
async function finish() {

    // Handle Failed Payment
    if (!/success/i.test(P.get('status') || 'success')) {
        $('#co').innerHTML = `
            <section class="panel empty-state">

                <div class="empty-emoji">⚠️</div>

                <h2>Payment failed</h2>

                <p class="muted">
                    Your order is saved. You can retry from My Orders.
                </p>

                <a class="btn primary" href="profile.html#orders">
                    View orders
                </a>

            </section>
        `;

        return;
    }

    try {
        // Update Order Payment Status
        await api(`/api/orders/${P.get('orderId')}/payment`, {
            method: 'PUT',
            body: {
                orderId: +P.get('orderId'),
                amount: +P.get('amount') || null,
                transactionId: P.get('transactionId')
            }
        });

        // Clear Cart After Successful Payment
        api('/api/cart/clear', {
            method: 'DELETE'
        }).catch(() => {});

        // Display Order Confirmation
        $('#co').innerHTML = `
            <section class="panel empty-state">

                <div class="empty-emoji">🎉</div>

                <h2>Order placed</h2>

                <p class="muted">
                    Transaction ID: ${esc(P.get('transactionId'))}
                </p>

                <a class="btn primary" href="profile.html#orders">
                    View my orders
                </a>

            </section>
        `;

    } catch (x) {
        $('#co').innerHTML = `
            <p class="muted">
                Payment received but the order could not be updated:
                ${esc(x.message)}
            </p>
        `;
    }
}