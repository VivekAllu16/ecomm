if(requireLogin()){
const tabs=['info','orders','address','password'];let addrs=[],editId=null;const AF=['houseNo','streetName','city','state','country','pincode'];
const show=()=>{const t=tabs.includes(location.hash.slice(1))?location.hash.slice(1):'info';
  tabs.forEach(n=>{$('#t-'+n).classList.toggle('on',n===t);$('#n-'+n).classList.toggle('active',n===t)});
  if(t==='orders')loadOrders();if(t==='address')loadAddr()};
window.onhashchange=show;$('#lo').onclick=logout;
(async()=>{try{const u=await api('/api/users/profile');
  $('#nm').textContent=u.name;$('#em').textContent=u.email;$('#av').textContent=(u.name||'?')[0].toUpperCase();
  $('#name').value=u.name;$('#email').value=u.email;$('#phoneNo').value=u.phoneNo||'';$('#alternativePhoneNo').value=u.alternativePhoneNo||'';$('#gender').value=u.gender||'';$('#birthday').value=u.birthday||''}catch(x){toast(x.message)}show()})();
$('#pf').onsubmit=async e=>{e.preventDefault();try{
  const u=await api('/api/users/updateprofile',{method:'PUT',body:{name:$('#name').value.trim(),email:$('#email').value.trim(),phoneNo:$('#phoneNo').value.trim(),alternativePhoneNo:$('#alternativePhoneNo').value.trim(),gender:$('#gender').value,birthday:$('#birthday').value}});
  $('#nm').textContent=u.name;showMsg($('#pm'),'Profile updated.',true)}catch(x){showMsg($('#pm'),x.message)}};
async function loadOrders(){const b=$('#ol');try{const o=await api('/api/orders/get');o.sort((a,b)=>new Date(b.orderDate)-new Date(a.orderDate));
  const back=encodeURIComponent(location.origin+location.pathname.replace(/[^/]*$/,'')+'checkout.html');
  b.innerHTML=o.length?o.map(x=>`<div class="order-row"><div><b>${esc(x.orderNo)}</b><br><small>${new Date(x.orderDate).toLocaleString('en-IN')}</small></div><span class="price">${money(x.amount)}</span><span class="status ${x.orderStatus}">${esc(x.orderStatus.replace('_',' '))}</span>
  <div>${x.orderStatus==='Payment_pending'?`<a class="btn primary" style="padding:8px 14px" href="${CONFIG.PAYMENT_URL}?orderId=${x.orderId}&orderNo=${x.orderNo}&amount=${x.amount}&applicationType=ECOMMERCE&returnUrl=${back}">Pay now</a> `:''}${['Payment_pending','Order_Placed'].includes(x.orderStatus)?`<button class="delete-address-btn" data-c="${x.orderId}">Cancel</button>`:''}</div></div>`).join(''):'<p class="muted">No orders yet. <a class="link" href="shop.html">Start shopping</a></p>'}catch(x){b.innerHTML=`<p class="muted">${esc(x.message)}</p>`}}
$('#ol').onclick=async e=>{const id=e.target.dataset.c;if(id&&confirm('Cancel this order?')){try{await api(`/api/orders/${id}/cancel`,{method:'PUT'});toast('Order cancelled');loadOrders()}catch(x){toast(x.message)}}};
async function loadAddr(){try{addrs=await api('/api/address/get');
  $('#al').innerHTML=addrs.length?addrs.map(a=>`<div class="saved-address"><div><b>${esc(a.houseNo)}, ${esc(a.streetName)}</b>${a.isPrimary?' <span class="default-address">✓ Primary</span>':''}<br>${esc(a.city)}, ${esc(a.state)}, ${esc(a.country)} – ${esc(a.pincode)}
  <div class="address-actions"><button class="edit-address-btn" data-e="${a.id}">Edit</button><button class="delete-address-btn" data-d="${a.id}">Delete</button>${a.isPrimary?'':`<button class="select-address-btn" data-p="${a.id}">Deliver here (set primary)</button>`}</div></div></div>`).join(''):'<p class="muted">No addresses saved yet.</p>'}catch(x){toast(x.message)}}
$('#addNew').onclick=()=>{editId=null;AF.forEach(k=>$('#'+k).value='');$('#country').value='India';$('#isPrimary').checked=false;$('#af').style.display='block'};
$('#cancelA').onclick=()=>$('#af').style.display='none';
$('#af').onsubmit=async e=>{e.preventDefault();const body={isPrimary:$('#isPrimary').checked};AF.forEach(k=>body[k]=$('#'+k).value.trim());
  try{await api(editId?'/api/address/update/'+editId:'/api/address/add',{method:editId?'PUT':'POST',body});$('#af').style.display='none';toast('Address saved');loadAddr()}catch(x){toast(x.message)}};
$('#al').onclick=async e=>{const t=e.target.dataset;try{
  if(t.e){const a=addrs.find(x=>x.id==t.e);editId=a.id;AF.forEach(k=>$('#'+k).value=a[k]||'');$('#isPrimary').checked=!!a.isPrimary;$('#af').style.display='block';$('#af').scrollIntoView({behavior:'smooth'})}
  if(t.d&&confirm('Delete this address?')){await api('/api/address/delete/'+t.d,{method:'DELETE'});loadAddr()}
  if(t.p){await api(`/api/address/${t.p}/primary`,{method:'PUT'});loadAddr()}}catch(x){toast(x.message)}};
$('#cf').onsubmit=async e=>{e.preventDefault();const m=$('#cm');
  if($('#newPassword').value!==$('#confirmNewPassword').value)return showMsg(m,'New passwords do not match.');
  try{await api('/api/users/change-password',{method:'PUT',body:{oldPassword:$('#oldPassword').value,newPassword:$('#newPassword').value,confirmNewPassword:$('#confirmNewPassword').value}});showMsg(m,'Password changed.',true);$('#cf').reset()}catch(x){showMsg(m,x.message)}};
}
