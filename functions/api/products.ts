interface Env {
  DB: D1Database;
}

// GET /api/products — list all products
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare("SELECT * FROM products").all();
  return Response.json(results);
};

// POST /api/products — add a product
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json();
  await context.env.DB.prepare(
    "INSERT INTO products (name, price, quantity, expiryDate, minStockLevel) VALUES (?, ?, ?, ?)"
  ).bind(body.name, body.price, body.quantity, body.minStockLevel).run();
  return Response.json({ success: true });
};
