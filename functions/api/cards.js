// functions/api/cards.js

// 1. 查詢所有卡片 (GET 請求)
export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const { results } = await DB.prepare("SELECT * FROM cards ORDER BY id DESC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2. 新增卡片 (POST 請求)
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const { card_name, general_rate, special_rate, note } = await context.request.json();

    if (!card_name) {
      return new Response(JSON.stringify({ error: "缺少卡片名稱" }), { status: 400 });
    }

    await DB.prepare(
      "INSERT INTO cards (card_name, general_rate, special_rate, note) VALUES (?, ?, ?, ?)"
    )
    .bind(card_name, general_rate, special_rate, note)
    .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 3. 刪除卡片 (DELETE 請求)
export async function onRequestDelete(context) {
  try {
    const { DB } = context.env;
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "缺少卡片 ID" }), { status: 400 });
    }

    await DB.prepare("DELETE FROM cards WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
