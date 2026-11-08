const P = new URLSearchParams(location.search);

let list = [];
let cats = [];

const K = [
    'brand',
    'minPrice',
    'maxPrice',
    'minRating'
];

// Load categories and initialize filters
(async () => {
    try {
        cats = await api('/api/categories/all');
    } catch {}

    const cur = P.get('categoryId');

    // Render category filter chips
    $('#chips').innerHTML = `
        <a href="shop.html" class="${cur ? '' : 'on'}">All</a>
    ` + cats.map(c => `
        <a
            href="shop.html?categoryId=${c.categoryId}"
            class="${cur == c.categoryId ? 'on' : ''}"
        >
            ${esc(c.name)}
        </a>
    `).join('');

    // Restore filter values from URL parameters
    K.forEach(k => {
        if (P.get(k)) {
            $('#' + k).value = P.get(k);
        }
    });

    load();
})();

// Fetch products using selected filters
async function load() {
    const q = new URLSearchParams();

    ['keyword', 'categoryId'].forEach(k => {
        if (P.get(k)) {
            q.set(k, P.get(k));
        }
    });

    K.forEach(k => {
        const v = $('#' + k).value.trim();

        if (v) {
            q.set(k, v);
        }
    });

    $('#shop-products').innerHTML = '<p class="muted">Loading…</p>';

    try {
        list = await api('/api/products/filter?' + q);
        draw();

    } catch (x) {
        $('#shop-products').innerHTML = `
            <p class="muted">${esc(x.message)}</p>
        `;
    }
}

// Sort and display products
function draw() {
    const s = $('#sort-products').value;
    const l = [...list];

    if (s === 'low') {
        l.sort((a, b) => a.price - b.price);
    }

    if (s === 'high') {
        l.sort((a, b) => b.price - a.price);
    }

    if (s === 'rating') {
        l.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const k = P.get('keyword');
    const c = cats.find(c => c.categoryId == P.get('categoryId'));

    $('#shop-title').textContent = k
        ? `Search results for "${k}"`
        : c
            ? `${c.name} products`
            : 'Shop all products';

    $('#shop-products').innerHTML = l.map(productCard).join('') || `
        <div class="panel empty-state" style="grid-column:1/-1">
            <h2>No products found</h2>
            <p class="muted">
                Try another search, category or filter.
            </p>
            <a class="btn primary" href="shop.html">View all products</a>
        </div>
    `;
}

// Handle filter submission
$('#filters').onsubmit = e => {
    e.preventDefault();
    load();
};

// Handle sorting
$('#sort-products').onchange = draw;