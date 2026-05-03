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
