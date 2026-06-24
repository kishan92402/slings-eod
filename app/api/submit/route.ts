import { supabase } from "../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record = { ...body, id: Date.now().toString() };

    const { error } = await supabase.from("responses").insert([record]);
    if (error) throw error;

    // Send Slack notification if webhook exists for this team
    try {
      const { data: webhookData } = await supabase
        .from("slack_webhooks")
        .select("webhook_url")
        .eq("team", body.team)
        .single();

      if (webhookData?.webhook_url) {
        const cash = Number(body.cash_collected || 0);
        const revenue = Number(body.revenue_generated || 0);
        const closed = Number(body.deals_closed || 0);
        const shown = Number(body.calls_shown || 0);

        const msg = {
          text: `✅ *${body.name}* just submitted their EOD for *${body.team}*`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `✅ *${body.name}* just submitted their EOD for *${body.team}* — ${body.date || new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
              },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Calls Shown*\n${shown}` },
                { type: "mrkdwn", text: `*Deals Closed*\n${closed}` },
                { type: "mrkdwn", text: `*Cash Collected*\n$${cash.toLocaleString()}` },
                { type: "mrkdwn", text: `*Revenue Generated*\n$${revenue.toLocaleString()}` },
              ],
            },
          ],
        };

        await fetch(webhookData.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg),
        });
      }
    } catch {
      // Slack notification failure should not block the submission
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to save response:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
