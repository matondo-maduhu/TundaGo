import { sqlClient, json, ensureDatabase } from './_db.js';
export default async function handler(req,res){
 if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
 const id=Number(req.query.id),d=String(req.query.phone||'').replace(/\D/g,'').slice(-9);
 if(!Number.isInteger(id)||d.length<9) return json(res,400,{error:'Weka namba ya oda na simu.'});
 try{
  await ensureDatabase();const sql=sqlClient();
  const o=await sql`SELECT o.id,o.status,o.payment_status,o.payment_method,o.total_amount,o.delivery_fee,o.created_at FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id=${id} AND right(regexp_replace(c.phone,'[^0-9]','','g'),9)=${d}`;
  if(!o.length) return json(res,404,{error:'Oda haijapatikana. Hakikisha namba ya oda na simu.'});
  const items=await sql`SELECT product_name,quantity,subtotal FROM order_items WHERE order_id=${id}`;
  return json(res,200,{order:o[0],items});
 }catch(e){console.error(e);return json(res,500,{error:'Hitilafu. Jaribu tena.'});}
}
