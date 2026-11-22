import { json } from './_db.js';
export default async function handler(req,res){
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 return json(res,501,{error:'Payment gateway ya moja kwa moja haijaunganishwa. Tumia malipo ya simu (manual) au cash.'});
}
