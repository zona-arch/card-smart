// functions/api/advisor.js

export async function onRequestPost(context) {
  try {
    const { AI } = context.env;
    const { prompt, cards } = await context.request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "缺少問題描述" }), { status: 400 });
    }

    // 將使用者目前擁有的卡片清單整理成文字，餵給 AI
    let cardInfo = "目前使用者擁有的信用卡清單如下：\n";
    if (cards && cards.length > 0) {
      cards.forEach(c => {
        cardInfo += `- ${c.card_name}: 一般回饋 ${c.general_rate}%, 特仕/指定回饋 ${c.special_rate}% (備註: ${c.note || '無'})\n`;
      });
    } else {
      cardInfo += "- 目前無任何卡片資料，請建議其申辦或隨意發揮。\n";
    }

    // 建立給 AI 的指令 (System Prompt)
    const systemInstruction = `你是一位專業的台灣信用卡與消費理財顧問。現在是 2026 年，請根據使用者提供的消費習慣，結合他們目前現有的信用卡，給出最聰明、最划算的刷卡組合建議與分配理由。請用親切、口語且條理清晰的方式回答，適度使用 Emoji 裝飾。`;

    // 呼叫 Cloudflare 免費額度內的強大文字模型 (Meta Llama 3)
    const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `${cardInfo}\n使用者的消費習慣與問題：${prompt}` }
      ]
    });

    return new Response(JSON.stringify({ answer: response.response }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
