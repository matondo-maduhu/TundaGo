import {sqlClient,json,adminOk,ensureDatabase} from '../_db.js';
export default async function handler(req,res){
 if(!adminOk(req)) return json(res,401,{error:'Unauthorized'});
 try{
  await ensureDatabase();const sql=sqlClient();
  if(req.method==='GET') return json(res,200,{products:await sql`SELECT id,name,description,price,unit,image_url,stock,is_available FROM products ORDER BY id`});
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const b=req.body||{},name=String(b.name||'').trim().slice(0,100),price=Number(b.price),stock=Number(b.stock),unit=String(b.unit||'moja').trim().slice(0,30),img=String(b.image_url||'').trim().slice(0,500),desc=String(b.description||'').slice(0,300),av=b.is_available!==false;
  if(!name||!(price>=0)||!Number.isInteger(stock)||stock<0) return json(res,400,{error:'Jina, bei na stock (namba nzima) vinahitajika.'});
  const id=Number(b.id);
  const r=Number.isInteger(id)&&id>0
   ?await sql`UPDATE products SET name=${name},price=${price},stock=${stock},unit=${unit},image_url=${img},description=${desc},is_available=${av} WHERE id=${id} RETURNING id`
   :await sql`INSERT INTO products(name,price,stock,unit,image_url,description,is_available) VALUES(${name},${price},${stock},${unit},${img},${desc},${av}) RETURNING id`;
  if(!r.length) return json(res,404,{error:'Bidhaa haipo'});
  return json(res,200,{id:r[0].id});
 }catch(e){console.error(e);return json(res,500,{error:'Could not save product'});}
}
