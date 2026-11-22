import { sqlClient, json, ensureDatabase } from './_db.js';
export default async function handler(req,res){
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 const b=req.body||{};
 const name=String(b.name||'').trim().slice(0,100),phone=String(b.phone||'').replace(/[^\d+]/g,''),location=String(b.location||'').trim().slice(0,300),notes=String(b.notes||'').trim().slice(0,500);
 const method=b.payment_method==='mobile_money'?'mobile_money':'cod';
 const ref=method==='mobile_money'?String(b.payment_reference||'').trim().toUpperCase().slice(0,40):null;
 if(!name||!location||phone.replace(/\D/g,'').length<9||!Array.isArray(b.items)||!b.items.length||b.items.length>50) return json(res,400,{error:'Jaza jina, namba sahihi ya simu, eneo na bidhaa.'});
 if(method==='mobile_money'&&ref.length<6) return json(res,400,{error:'Weka namba ya muamala (transaction ID) ya malipo.'});
 const q={};
 for(const i of b.items){const id=Number(i.product_id),n=Number(i.quantity);if(!Number.isInteger(id)||!Number.isInteger(n)||n<1||n>100)return json(res,400,{error:'Bidhaa si sahihi.'});q[id]=(q[id]||0)+n;}
 const lines=Object.entries(q).map(([product_id,qty])=>({product_id:Number(product_id),qty}));
 try{
  await ensureDatabase();const sql=sqlClient();
  const rows=await sql`SELECT id,name,stock FROM products WHERE is_available=true AND id=ANY(${lines.map(l=>l.product_id)})`;
  if(rows.length!==lines.length) return json(res,400,{error:'Bidhaa moja haipatikani tena. Onyesha upya ukurasa.'});
  for(const r of rows) if(q[r.id]>r.stock) return json(res,400,{error:`${r.name}: zimebaki ${r.stock} tu.`});
  const fee=Math.max(0,Number(process.env.DELIVERY_FEE||0))||0;
  const out=await sql`WITH l AS (SELECT p.id,p.name,p.price,x.qty FROM jsonb_to_recordset(${JSON.stringify(lines)}::jsonb) AS x(product_id bigint,qty int) JOIN products p ON p.id=x.product_id),
   c AS (INSERT INTO customers(name,phone,delivery_location) VALUES(${name},${phone},${location}) RETURNING id),
   o AS (INSERT INTO orders(customer_id,total_amount,delivery_fee,notes,payment_method,payment_reference) SELECT c.id,(SELECT SUM(price*qty) FROM l)+${fee}::numeric,${fee}::numeric,${notes}::text,${method}::text,${ref}::text FROM c RETURNING id,total_amount,delivery_fee,status,payment_status,payment_method,created_at),
   i AS (INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity,subtotal) SELECT o.id,l.id,l.name,l.price,l.qty,l.price*l.qty FROM o,l),
   s AS (UPDATE products p SET stock=p.stock-l.qty FROM l WHERE p.id=l.id)
   SELECT * FROM o`;
  return json(res,201,{order:out[0]});
 }catch(e){
  console.error(e);
  if(e.code==='23514') return json(res,400,{error:'Stock imeisha wakati unaagiza. Onyesha upya ukurasa.'});
  if(e.code==='23505') return json(res,400,{error:'Namba hii ya muamala imeshatumika.'});
  return json(res,500,{error:'Oda haikuhifadhiwa. Jaribu tena.'});
 }
}
