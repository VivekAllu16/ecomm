/* =========================================
   CONFIGURATION
========================================= */

const CONFIG = {
    API: 'http://localhost:8082',
    PAYMENT_URL: 'http://localhost:8081/payment.html',
    FREE_DELIVERY_ABOVE: 500,
    DELIVERY_CHARGE: 40
};


/* =========================================
   COMMON HELPER FUNCTIONS
========================================= */

// DOM Selector
const $ = (s, r = document) => r.querySelector(s);

// Currency Formatter
const money = n =>
    '₹' + Number(n || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 2
    });

// Image URL Formatter
const img = u => u || 'images/placeholder.png';

// Get Authentication Token
const token = () => localStorage.getItem('token');

// HTML Escape Function
const esc = s =>
    String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));


/* =========================================
   CATEGORY IMAGE HANDLER
========================================= */

/*
 * Category image files are stored in:
 * images/categories/
 *
 * Images are matched by category name,
 * otherwise the category ID is used.
 */

const catImg = c => {
    const n = c.name.toLowerCase();

    const m = {
        toy: 'Toys',
        beau: 'Beauty',
        fas: 'Fashion',
        elec: 'Electronics',
        foot: 'Footware'
    };

    const k = Object.keys(m).find(k => n.includes(k));

    return 'images/' + (k ? m[k] : c.categoryId) + '.png';
};


/* =========================================
   API HELPER
========================================= */

async function api(path, o = {}) {
    const h = {
        'Content-Type': 'application/json'
    };

    if (token()) {
        h.Authorization = 'Bearer ' + token();
    }

    const r = await fetch(CONFIG.API + path, {
        method: o.method || 'GET',
        headers: h,
        body: o.body ? JSON.stringify(o.body) : undefined
    });

    const t = await r.text();

    let d;

    try {
        d = JSON.parse(t);
    } catch {
        d = t;
    }

    if (!r.ok) {
        if (r.status === 401) {
            localStorage.removeItem('token');
        }

        throw new Error(
            (d && d.message) ||
            (typeof d === 'string' && d) ||
            'Something went wrong'
        );
    }

    return d;
}


/* =========================================
   NOTIFICATIONS AND FORM MESSAGES
========================================= */

// Toast Notification
function toast(m) {
    const t = $('#toast');

    t.textContent = m;
    t.style.display = 'block';

    clearTimeout(t._t);

    t._t = setTimeout(() => {
        t.style.display = 'none';
    }, 2600);
}

// Form Message
function showMsg(el, m, ok) {
    el.textContent = m;
    el.className = 'form-message' + (ok ? ' ok' : '');
}


/* =========================================
   AUTHENTICATION
========================================= */

// Check Login Status
function requireLogin() {
    if (!token()) {
        location.href = 'login.html?next=' +
            encodeURIComponent(
                location.pathname.split('/').pop() + location.search
            );

        return false;
    }

    return true;
}

// Logout
function logout() {
    api('/api/users/logout', {
        method: 'POST'
    })
        .catch(() => {})
        .finally(() => {
            localStorage.clear();
            location.href = 'login.html';
        });
}


/* =========================================
   PRODUCT CARD
========================================= */

function productCard(p) {
    const link = `product.html?id=${p.productId}`;

    return `
        <article class="product-card">

            <div class="product-image">

                ${p.rating
                    ? `<span class="product-tag">${p.rating}★</span>`
                    : ''
                }

                <a href="${link}">
                    <img
                        class="product-img"
                        src="${img(p.imageUrl)}"
                        alt="${esc(p.name)}"
                        loading="lazy"
                        onerror="this.src='images/placeholder.png'"
                    >
                </a>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${esc(p.brand)}
                </span>

                <h3 class="product-title">
                    <a
                        class="product-link"
                        href="${link}"
                        title="${esc(p.name)}"
                    >
                        ${esc(p.name)}
                    </a>
                </h3>

                <div class="product-bottom">

                    <span class="price">
                        ${money(p.price)}
                    </span>

                    <button
                        class="add-btn"
                        data-add="${p.productId}"
                    >
                        ＋ Add
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================
   ADD TO CART
========================================= */

async function addToCart(id, qty = 1, btn) {
    if (!requireLogin()) return false;

    try {
        await api('/api/cart/add', {
            method: 'POST',
            body: {
                productId: id,
                quantity: qty
            }
        });

        cartCount();

        if (btn) {
            btn.textContent = '✓ Added';

            setTimeout(() => {
                if (btn.isConnected) {
                    btn.textContent = '＋ Add';
                }
            }, 900);
        }

        return true;

    } catch (x) {
        toast(x.message);
        return false;
    }
}


// Handle Add-to-Cart Clicks
document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');

    if (b) {
        addToCart(+b.dataset.add, 1, b);
    }
});


/* =========================================
   CART COUNT
========================================= */

async function cartCount() {
    if (!token()) return;

    try {
        const c = await api('/api/cart/view');

        $('#header-cart-count').textContent = c.totalItems || 0;

    } catch {}
}


/* =========================================
   HEADER AND FOOTER
========================================= */

// Website Logo
const LOGO = `
    <img
        src="images/Designer.png"
        alt="easyBuy"
        class="brand-logo"
        onerror="this.outerHTML='easyBuy'"
    >
`;

// Render Shared Header and Footer
function renderChrome() {

    // Header
    const h = $('#site-header');

    if (h) {
        h.innerHTML = `
            <header class="site-header">

                <div class="header-inner">

                    <a class="brand" href="index.html">
                        ${LOGO}
                    </a>

                    <form class="search-wrap" id="search-form">

                        <span class="search-icon">⌕</span>

                        <input
                            id="search-input"
                            placeholder="Search products, brands and more"
                            aria-label="Search products"
                        >

                    </form>

                    <nav class="header-links">

                        <a href="${token() ? 'profile.html' : 'login.html'}">
                            ♟ ${token() ? 'My Profile' : 'Sign Up'}
                        </a>

                        <a href="cart.html">
                            🛒 My Cart
                            <span class="cart-count" id="header-cart-count">
                                0
                            </span>
                        </a>

                    </nav>

                </div>

            </header>
        `;

        $('#search-input').value =
            new URLSearchParams(location.search).get('keyword') || '';

        $('#search-form').onsubmit = e => {
            e.preventDefault();

            location.href = 'shop.html?keyword=' +
                encodeURIComponent($('#search-input').value.trim());
        };

        cartCount();
    }

    // Footer
    const f = $('#site-footer');

    if (f) {
        f.innerHTML = `
            <footer class="site-footer">

                <div class="footer-inner">

                    <a class="brand" href="index.html">
                        ${LOGO.replace('brand-logo', 'footer-logo')}
                    </a>

                    <span>🚚 Easy delivery</span>
                    <span>🔒 Secure shopping</span>
                    <span>Simple shopping for everyday life.</span>

                    <nav class="footer-links">
                        <a href="shop.html">Shop</a>
                        <a href="profile.html#orders">Orders</a>
                        <a href="profile.html">Profile</a>
                    </nav>

                </div>

            </footer>
        `;
    }

    // Toast Container
    if (!$('#toast')) {
        document.body.insertAdjacentHTML(
            'beforeend',
            '<div id="toast" role="status"></div>'
        );
    }
}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener('DOMContentLoaded', renderChrome);