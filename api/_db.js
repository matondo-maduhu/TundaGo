import { neon } from '@neondatabase/serverless';
export function sqlClient(){
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');
  return neon(process.env.DATABASE_URL);
}
export function method(req, allowed){
  if(!allowed.includes(req.method)) return false;
  return true;
}
export function adminOk(req){
  const token=req.headers['x-admin-token'];
  return Boolean(process.env.ADMIN_TOKEN && token && token===process.env.ADMIN_TOKEN);
}
export function json(res,status,body){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8').send(JSON.stringify(body));
}
