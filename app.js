let products=[],cfg={delivery_fee:0},cart={};
try{cart=JSON.parse(localStorage.getItem('cart')||'{}')}catch{}
const $=s=>document.querySelector(s),money=n=>'TSh '+Number(n).toLocaleString('en-US');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ST={pending:'Imepokelewa',paid:'Imelipwa',preparing:'Inaandaliwa',delivering:'Iko njiani',completed:'Imekamilika',cancelled:'Imefutwa'};
async function init(){
 try{const [p,c]=await Promise.all([fetch('/api/products').then(r=>r.json()),fetch('/api/config').then(r=>r.json())]);products=p.products||[];cfg=c;}
 catch{$('#products').innerHTML='<p>Bidhaa hazijapatikana. Jaribu tena baadaye.</p>';return;}
 const lo=JSON.parse(localStorage.getItem('lastOrder')||'null');if(lo){const f=$('#trackForm');f.id.value=lo.id;f.phone.value=lo.phone;}
 const cu=JSON.parse(localStorage.getItem('cust')||'null');if(cu){const f=$('#orderForm');f.name.value=cu.name||'';f.phone.value=cu.phone||'';f.location.value=cu.location||'';}
 renderProducts();renderCart();
}
function renderProducts(){
 const q=($('#search')?.value||'').toLowerCase();
 $('#products').innerHTML=products.filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<article class="product"><img loading="lazy" src="${safe(p.image_url)}" alt="${safe(p.name)}" onerror="this.style.display='none'"><h3>${safe(p.name)}</h3><div class="price">${money(p.price)} / ${safe(p.unit)}</div><small>${p.stock>0?p.stock+' zimebaki':'Zimeisha'}</small><button onclick="add(${p.id})" ${p.stock<=0?'disabled':''}>+ Ongeza kwenye cart</button></article>`).join('')||'<p>Hakuna bidhaa inayolingana.</p>';
}
function save(){localStorage.setItem('cart',JSON.stringify(cart));}
function add(id){const p=products.find(x=>x.id==id);if(!p)return;if((cart[id]||0)>=p.stock){alert('Zimebaki '+p.stock+' tu.');return;}cart[id]=(cart[id]||0)+1;renderCart();}
function change(id,n){const p=products.find(x=>x.id==id);if(n>0&&(cart[id]||0)>=p.stock){alert('Zimebaki '+p.stock+' tu.');return;}cart[id]+=n;if(cart[id]<=0)delete cart[id];renderCart();}
function renderCart(){
 for(const id of Object.keys(cart)){const p=products.find(x=>x.id==id);if(!p||p.stock<=0)delete cart[id];else if(cart[id]>p.stock)cart[id]=p.stock;}
 let count=0,sub=0;
 $('#cartItems').innerHTML=Object.entries(cart).map(([id,q])=>{const p=products.find(x=>x.id==id);count+=q;sub+=Number(p.price)*q;return `<div class="cartrow"><div><b>${safe(p.name)}</b><br><small>${money(p.price)} × ${q}</small></div><div class="qty"><button onclick="change(${id},-1)">−</button> ${q} <button onclick="change(${id},1)">+</button></div></div>`}).join('')||'<div class="empty">Kikapu bado hakina bidhaa.</div>';
 const fee=count?Number(cfg.delivery_fee||0):0;
 $('#cartCount').textContent=count;$('#subtotal').textContent=money(sub);$('#fee').textContent=money(fee);$('#total').textContent=money(sub+fee);save();
}
document.querySelectorAll('[name=payment_method]').forEach(r=>r.addEventListener('change',()=>{
 const m=$('[name=payment_method]:checked').value==='mobile_money';$('#momo').hidden=!m;
 $('#momoInfo').innerHTML=cfg.pay_number?`Tuma <b>${$('#total').textContent}</b> kwa <b>${safe(cfg.pay_network)}</b> namba <b>${safe(cfg.pay_number)}</b> (${safe(cfg.pay_name)}), kisha weka namba ya muamala hapa chini.`:'Malipo ya simu hayajawekwa na duka. Chagua cash.';
}));
$('#orderForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!Object.keys(cart).length){alert('Ongeza bidhaa kwenye cart kwanza.');return;}
 const f=new FormData(e.target),m=f.get('payment_method');
 if(m==='mobile_money'&&!cfg.pay_number){alert('Malipo ya simu hayapatikani. Chagua cash.');return;}
 const payload={name:f.get('name'),phone:f.get('phone'),location:f.get('location'),notes:f.get('notes'),payment_method:m,payment_reference:f.get('payment_reference'),items:Object.entries(cart).map(([product_id,quantity])=>({product_id:Number(product_id),quantity}))};
 const btn=e.target.querySelector('button');btn.disabled=true;btn.textContent='Inatuma oda...';
 try{
  const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();
  if(!r.ok)throw new Error(d.error||'Oda haikutumwa');
  localStorage.setItem('lastOrder',JSON.stringify({id:d.order.id,phone:payload.phone}));
  localStorage.setItem('cust',JSON.stringify({name:payload.name,phone:payload.phone,location:payload.location}));
  const wa=cfg.shop_phone?` <a href="https://wa.me/${safe(cfg.shop_phone)}?text=${encodeURIComponent('Habari, oda yangu #'+d.order.id)}">Wasiliana nasi WhatsApp</a>`:'';
  $('#result').innerHTML=`<section class="panel"><h2>Oda #${d.order.id} imepokelewa ✅</h2><p>Jumla: <b>${money(d.order.total_amount)}</b> · ${m==='cod'?'Lipa ukipokea':'Malipo yatahakikiwa na duka'}</p><div class="notice">Hifadhi namba ya oda <b>#${d.order.id}</b> kufuatilia hali yake.${wa}</div></section>`;
  cart={};e.target.reset();$('#momo').hidden=true;const lo=JSON.parse(localStorage.getItem('lastOrder'));$('#trackForm').id.value=lo.id;$('#trackForm').phone.value=lo.phone;
  await init();$('#result').scrollIntoView({behavior:'smooth'});
 }catch(err){alert(err.message);}finally{btn.disabled=false;btn.textContent='Tuma oda';}
});
$('#trackForm').addEventListener('submit',async e=>{
 e.preventDefault();const f=e.target,box=$('#trackResult');box.textContent='Inatafuta...';
 try{
  const r=await fetch(`/api/track?id=${encodeURIComponent(f.id.value)}&phone=${encodeURIComponent(f.phone.value)}`);const d=await r.json();if(!r.ok)throw new Error(d.error);
  const o=d.order;box.innerHTML=`<div class="notice"><b>Oda #${o.id}: ${ST[o.status]||safe(o.status)}</b><br>Malipo: ${o.payment_status==='paid'?'Yamethibitishwa':'Hayajathibitishwa'} · Jumla ${money(o.total_amount)}<br><small>${d.items.map(i=>safe(i.product_name)+' × '+i.quantity).join(', ')}</small></div>`;
 }catch(err){box.textContent=err.message;}
});
init();
