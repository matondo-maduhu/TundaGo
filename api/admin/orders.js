import {sqlClient,json,adminOk,ensureDatabase} from '../_db.js';
export default async function handler(req,res){
 if(!adminOk(req)) return json(res,401,{error:'Unauthorized'});
 if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
 try{
  await ensureDatabase();const sql=sqlClient();
  const orders=await sql`SELECT o.id,o.total_amount,o.delivery_fee,o.status,o.payment_status,o.payment_method,o.payment_reference,o.notes,o.created_at,c.name,c.phone,c.delivery_location FROM orders o LEFT JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 200`;
  const items=await sql`SELECT order_id,product_name,unit_price,quantity,subtotal FROM order_items WHERE order_id=ANY(${orders.map(o=>o.id)})`;
  for(const o of orders) o.items=items.filter(i=>i.order_id===o.id);
  return json(res,200,{orders});
 }catch(e){console.error(e);return json(res,500,{error:'Could not load orders'});}
}
