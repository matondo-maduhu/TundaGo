import {sqlClient,json,adminOk,ensureDatabase} from '../_db.js';
export default async function handler(req,res){
 if(!adminOk(req)) return json(res,401,{error:'Unauthorized'});
 if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
 try{
  await ensureDatabase();
  const sql=sqlClient();
  const orders=await sql`SELECT o.id,o.total_amount,o.delivery_fee,o.status,o.payment_status,o.notes,o.created_at,c.name,c.phone,c.delivery_location FROM orders o LEFT JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 100`;
  const items=await sql`SELECT order_id,product_name,unit_price,quantity,subtotal FROM order_items ORDER BY order_id DESC`;
  return json(res,200,{orders,items});
 }catch(e){console.error(e);return json(res,500,{error:'Could not load admin orders'});}
}
