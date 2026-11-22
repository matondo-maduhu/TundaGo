import { json } from './_db.js';
export default async function handler(req,res){
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 // Payment provider has not been integrated. Keep credentials server-side only.
 return json(res,501,{error:'Webpush payment is not connected yet. Do not send money through this demo.'});
}
