import { sqlClient, json, ensureDatabase } from './_db.js';
export default async function handler(req,res){
 if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
 try { await ensureDatabase(); const sql=sqlClient(); const products=await sql`SELECT id,name,description,price,unit,image_url,stock,is_available FROM products WHERE is_available=true ORDER BY id`;
  return json(res,200,{products});
 } catch(e){ console.error(e); return json(res,500,{error:'Could not load products'}); }
}
