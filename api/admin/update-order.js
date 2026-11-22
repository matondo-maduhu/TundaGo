import {sqlClient,json,adminOk,ensureDatabase} from '../_db.js';
const ST=['pending','paid','preparing','delivering','completed','cancelled'],PS=['unpaid','paid','failed'];
export default async function handler(req,res){
 if(!adminOk(req)) return json(res,401,{error:'Unauthorized'});
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 const b=req.body||{},id=Number(b.order_id),status=b.status||null,pay=b.payment_status||null;
 if(!Number.isInteger(id)||(status&&!ST.includes(status))||(pay&&!PS.includes(pay))) return json(res,400,{error:'Invalid order or status'});
 try{
  await ensureDatabase();const sql=sqlClient();
  const rows=await sql`WITH o AS (UPDATE orders SET status=COALESCE(${status}::text,status),
    payment_status=CASE WHEN ${pay}::text IS NOT NULL THEN ${pay}::text WHEN ${status}::text='completed' AND payment_method='cod' THEN 'paid' ELSE payment_status END
    WHERE id=${id} AND status<>'cancelled' RETURNING id,status,payment_status),
   r AS (UPDATE products p SET stock=p.stock+oi.quantity FROM order_items oi WHERE oi.order_id=${id} AND p.id=oi.product_id AND ${status}::text='cancelled' AND EXISTS(SELECT 1 FROM o))
   SELECT * FROM o`;
  if(!rows.length) return json(res,404,{error:'Oda haipo au tayari imefutwa.'});
  return json(res,200,{order:rows[0]});
 }catch(e){console.error(e);return json(res,500,{error:'Could not update order'});}
}
