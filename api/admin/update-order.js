import {sqlClient,json,adminOk} from '../_db.js';
const allowed=['pending','paid','preparing','delivering','completed','cancelled'];
export default async function handler(req,res){
 if(!adminOk(req)) return json(res,401,{error:'Unauthorized'});
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 const id=Number(req.body?.order_id), status=req.body?.status;
 if(!Number.isInteger(id)||!allowed.includes(status)) return json(res,400,{error:'Invalid order or status'});
 try{const sql=sqlClient(); const rows=await sql`UPDATE orders SET status=${status}, payment_status=CASE WHEN ${status}='paid' THEN 'paid' ELSE payment_status END WHERE id=${id} RETURNING id,status,payment_status`;
  if(!rows.length)return json(res,404,{error:'Order not found'});
  return json(res,200,{order:rows[0]});
 }catch(e){console.error(e);return json(res,500,{error:'Could not update order'});}
}
