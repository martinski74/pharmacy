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
  try {
    const body = await context.request.json();
    
    // Validate required fields
    if (!body.name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    await context.env.DB.prepare(
      "INSERT INTO products (name, price, quantity, expiryDate, minStockLevel) VALUES (?, ?, ?, ?, ?)"
    ).bind(
      body.name,
      body.price ?? 0,
      body.quantity ?? 0,
      body.expiryDate ?? null,
      body.minStockLevel ?? 10
    ).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
