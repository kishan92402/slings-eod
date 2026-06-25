import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Strip form-only fields that aren't DB columns
    const { talk_time_hours, talk_time_minutes, ...rest } = body;
    const record = { ...rest, id: Date.now().toString() };

    const { error } = await supabase.from("setter_responses").insert([record]);
    if (error) throw error;

    // Slack notification
    try {
      const { data: webhookData } = await supabase
        .from("slack_webhooks")
        .select("webhook_url")
        .eq("team", body.team)
        .eq("role", "setter")
        .single();

      if (webhookData?.webhook_url) {
        const dateStr = body.date
          ? new Date(body.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        const cashHT = Number(body.cash_ht || 0);
        const revenueHT = Number(body.revenue_ht || 0);
        const cashLT = Number(body.cash_lt || 0);
        const revenueLT = Number(body.revenue_lt || 0);

        const lines = [
          `*New Phone Setter EOD!*`,
          `*Date:* ${dateStr}`,
          `*Sales Rep:* ${body.name}`,
          `*Dials:* ${body.dials || 0}`,
          `*Connections:* ${body.connections || 0}`,
          `*Conversations:* ${body.conversations || 0}`,
          `*Quality Conversations:* ${body.quality_conversations || 0}`,
          `*Appointments Set:* ${body.appointments_set || 0}`,
          `*Sets Showed:* ${body.sets_showed || 0}`,
          `*Confirmed Triaged:* ${body.confirmed_triaged || 0}`,
          `*Triaged Showed:* ${body.triaged_showed || 0}`,
          `*Offers Given (LT):* ${body.offers_given_lt || 0}`,
          `*Low Ticket Deals Closed:* ${body.lt_deals_closed || 0}`,
          `*Deals Closed (HT):* ${body.ht_deals_closed || 0}`,
          `*Talk Time:* ${body.talk_time || 0}`,
          `*Cash Collected (HT):* $${cashHT.toLocaleString()}`,
          `*Revenue Generated (HT):* $${revenueHT.toLocaleString()}`,
          `*Cash Collected (LT):* $${cashLT.toLocaleString()}`,
          `*Revenue Generated (LT):* $${revenueLT.toLocaleString()}`,
        ].join("\n");

        await fetch(webhookData.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `New Setter EOD — ${body.name} (${body.team})`,
            blocks: [{ type: "section", text: { type: "mrkdwn", text: lines } }],
          }),
        });
      }
    } catch {
      // Slack failure should not block submission
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to save setter response:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
