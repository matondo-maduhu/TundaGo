import { neon } from '@neondatabase/serverless';

let initPromise;
export function sqlClient(){
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');
  return neon(process.env.DATABASE_URL);
}

// Automatically creates the TundaGo tables on the first API request.
// This runs only on the server; DATABASE_URL is never exposed to the browser.
export async function ensureDatabase(){
  if(!initPromise){
    initPromise=(async()=>{
      const sql=sqlClient();
      await sql`CREATE TABLE IF NOT EXISTS products (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
        unit TEXT NOT NULL DEFAULT 'piece',
        image_url TEXT,
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS customers (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        delivery_location TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS orders (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        customer_id BIGINT REFERENCES customers(id),
        total_amount NUMERIC(12,2) NOT NULL,
        delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','preparing','delivering','completed','cancelled')),
        payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed')),
        payment_reference TEXT UNIQUE,
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id BIGINT REFERENCES products(id),
        product_name TEXT NOT NULL,
        unit_price NUMERIC(12,2) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        subtotal NUMERIC(12,2) NOT NULL
      )`;
      await sql`INSERT INTO products(name,description,price,unit,image_url,stock)
        SELECT 'Maembe','Maembe fresh',1500,'moja','https://images.unsplash.com/photo-1553279768-865b7e7f6c1c?auto=format&fit=crop&w=600&q=80',30
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Maembe')`;
      await sql`INSERT INTO products(name,description,price,unit,image_url,stock)
        SELECT 'Ndizi','Ndizi fresh',3000,'fungu','https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',25
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Ndizi')`;
      await sql`INSERT INTO products(name,description,price,unit,image_url,stock)
        SELECT 'Machungwa','Machungwa fresh',2500,'kilo','https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80',20
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Machungwa')`;
      await sql`INSERT INTO products(name,description,price,unit,image_url,stock)
        SELECT 'Parachichi','Parachichi fresh',1000,'moja','https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',40
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Parachichi')`;
      await sql`INSERT INTO products(name,description,price,unit,image_url,stock)
        SELECT 'Nanasi','Nanasi fresh',3500,'moja','https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',15
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Nanasi')`;
    })().catch(err=>{initPromise=undefined;throw err;});
  }
  return initPromise;
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
