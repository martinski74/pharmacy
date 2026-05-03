interface Env {
  DB: D1Database;
}

// GET /api/products/1
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  const result = await context.env.DB.prepare(
    "SELECT * FROM products WHERE id = ?"
  ).bind(id).first();
  return Response.json(result);
};

// DELETE /api/products/1
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  await context.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return Response.json({ success: true });
};

// PUT /api/products/1 — edit product
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id;
    const body = await context.request.json();

    if (!body.name) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }

    await context.env.DB.prepare(
      "UPDATE products SET name = ?, price = ?, quantity = ?, expiryDate = ?, minStockLevel = ? WHERE id = ?"
    ).bind(
      body.name,
      body.price ?? 0,
      body.quantity ?? 0,
      body.expiryDate ?? null,
      body.minStockLevel ?? 10,
      id
    ).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};