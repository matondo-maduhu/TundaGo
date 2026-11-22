import { sqlClient, json, ensureDatabase } from './_db.js';
export default async function handler(req,res){
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 const {name,phone,location,notes,items}=req.body||{};
 if(!name||!phone||!location||!Array.isArray(items)||items.length<1) return json(res,400,{error:'Fill name, phone, delivery location and cart items'});
 if(items.length>50) return json(res,400,{error:'Too many items'});
 try{
  await ensureDatabase();
  const sql=sqlClient();
  const customerRows=await sql`INSERT INTO customers(name,phone,delivery_location) VALUES(${String(name).trim()},${String(phone).trim()},${String(location).trim()}) RETURNING id`;
  const customerId=customerRows[0].id;
  let total=0, clean=[];
  for(const item of items){
   const id=Number(item.product_id), qty=Number(item.quantity);
   if(!Number.isInteger(id)||!Number.isInteger(qty)||qty<1||qty>100) return json(res,400,{error:'Invalid cart item'});
   const rows=await sql`SELECT id,name,price,unit,stock FROM products WHERE id=${id} AND is_available=true`;
   if(!rows.length) return json(res,400,{error:'Product not found'});
   const p=rows[0]; if(qty>p.stock) return json(res,400,{error:`Not enough stock for ${p.name}`});
   const subtotal=Number(p.price)*qty; total+=subtotal; clean.push({...p,quantity:qty,subtotal});
  }
  const orderRows=await sql`INSERT INTO orders(customer_id,total_amount,notes) VALUES(${customerId},${total},${String(notes||'')}) RETURNING id,total_amount,status,payment_status,created_at`;
  const order=orderRows[0];
  for(const p of clean){
   await sql`INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity,subtotal) VALUES(${order.id},${p.id},${p.name},${p.price},${p.quantity},${p.subtotal})`;
  }
  return json(res,201,{order,items:clean.map(p=>({name:p.name,quantity:p.quantity,unit:p.unit,price:p.price,subtotal:p.subtotal})),message:'Order saved. Payment integration is not active yet.'});
 }catch(e){console.error(e);return json(res,500,{error:'Could not save order'});}
}
