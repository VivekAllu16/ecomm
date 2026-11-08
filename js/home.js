(async () => {
    let cs = [];

    // Load categories
    try {
        cs = await api('/api/categories/all');

        $('#cats').innerHTML = cs
            .map(c => `
                <a class="category" href="shop.html?categoryId=${c.categoryId}">
                    <img
                        src="${catImg(c)}"
                        alt="${esc(c.name)}"
                        onerror="this.style.visibility='hidden'"
                    >
                    <p>${esc(c.name)}</p>
                </a>
            `)
            .join('');
    } catch {
        $('#cats').innerHTML = '<p class="muted">Could not load categories.</p>';
    }

    // Find category IDs by name
    const id = n => {
        const c = cs.find(c => c.name.toLowerCase().startsWith(n));
        return c ? c.categoryId : null;
    };

    // Set promotional banner links
    $('#b1').href = 'shop.html?categoryId=' + (id('fas') || 3);
    $('#b2').href = 'shop.html?categoryId=' + (id('elec') || 4);

    // Load popular products
    try {
        const ps = await api('/api/products/foryou');

        ps.sort(() => Math.random() - 0.5);

        $('#pop').innerHTML = ps
            .slice(0, 8)
            .map(productCard)
            .join('') || '<p class="muted">No products yet.</p>';
    } catch {
        $('#pop').innerHTML = '<p class="muted">Could not load products.</p>';
    }
})();