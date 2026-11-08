let qty=1,prod;const id=new URLSearchParams(location.search).get('id');
(async()=>{try{prod=await api('/api/products/'+id);
  const im=prod.imageUrls&&prod.imageUrls.length?prod.imageUrls:[null],ok=prod.stock>0;
  $('#product-details').innerHTML=`<div class="product-page"><div class="product-image-section"><img id="mainimg" class="detail-image" src="${img(im[0])}" alt="${esc(prod.name)}" onerror="this.src='images/placeholder.png'">
  ${im.length>1?`<div class="thumbs">${im.map((u,i)=>`<img src="${img(u)}" class="${i?'':'on'}" alt="" data-u="${img(u)}">`).join('')}</div>`:''}</div>
  <div class="product-info-section"><span class="product-category">${esc(prod.categoryName)} · ${esc(prod.brand)}</span><h1>${esc(prod.name)}</h1>${prod.rating?`<div class="detail-rating">${prod.rating}★</div>`:''}
  <div class="detail-price"><span class="current-price">${money(prod.price)}</span></div>
  <p class="${ok?'stock-ok':'stock-no'}">${ok?'In stock'+(prod.stock<10?` · only ${prod.stock} left`:''):'Out of stock'}</p>
  <div class="feature-icons"><div class="feature">🚚 Easy delivery</div><div class="feature">🔒 Secure payment</div><div class="feature">✅ Free delivery above ${money(CONFIG.FREE_DELIVERY_ABOVE)}</div></div>
  <div class="quantity-controls"><b>Quantity</b><button id="mn" aria-label="Decrease">−</button><span id="qv">1</span><button id="pl" aria-label="Increase">＋</button></div>
  <div class="product-actions"><button class="add-cart-btn" id="add" ${ok?'':'disabled'}>Add To Cart</button><button class="buy-now-btn" id="buy" ${ok?'':'disabled'}>Buy Now</button></div>
  <div class="description-box"><h3>Product Description</h3><p class="muted">${esc(prod.description)}</p></div></div></div>`;
  document.title=prod.name+' | easyBuy';
  const t=$('.thumbs');if(t)t.onclick=e=>{if(e.target.dataset.u){$('#mainimg').src=e.target.dataset.u;document.querySelectorAll('.thumbs img').forEach(i=>i.classList.toggle('on',i===e.target))}};
  $('#mn').onclick=()=>{qty=Math.max(1,qty-1);$('#qv').textContent=qty};$('#pl').onclick=()=>{qty=Math.min(prod.stock,qty+1);$('#qv').textContent=qty};
  $('#add').onclick=async()=>{if(await addToCart(prod.productId,qty))toast('Added to cart')};
  $('#buy').onclick=async()=>{if(await addToCart(prod.productId,qty))location.href='cart.html'};
}catch(x){$('#product-details').innerHTML=`<div class="panel empty-state"><h2>Product not found</h2><p class="muted">${esc(x.message)}</p><a href="shop.html" class="btn primary">Continue shopping</a></div>`}})();
