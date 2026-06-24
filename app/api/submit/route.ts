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
        const booked   = Number(body.calls_booked || 0);
        const shown    = Number(body.calls_shown || 0);
        const cancelled = Number(body.calls_cancelled || 0);
        const noShows  = Math.max(0, booked - shown - cancelled);
        const slots    = Number(body.slots_open || 0);
        const offers   = Number(body.offers_given || 0);
        const deposits = Number(body.deposits_taken || 0);
        const rescMade = Number(body.reschedules_made || 0);
        const rescShown = Number(body.reschedules_shown || 0);
        const fuSched  = Number(body.followup_scheduled || 0);
        const fuShown  = Number(body.followup_shown || 0);
        const closed   = Number(body.deals_closed || 0);
        const cash     = Number(body.cash_collected || 0);
        const revenue  = Number(body.revenue_generated || 0);

        const dateStr = body.date
          ? new Date(body.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

        const lines = [
          `*New Closer EOD!*`,
          `*Date:* ${dateStr}`,
          `*Sales Rep:* ${body.name}`,
          `*New Calls Booked:* ${booked}`,
          `*New Calls Shown:* ${shown}`,
          `*No Shows:* ${noShows}`,
          `*Canceled:* ${cancelled}`,
          `*Available Slots:* ${slots}`,
          `*Offers Given:* ${offers}`,
          `*Deposits Taken:* ${deposits}`,
          `*Rescheduled:* ${rescMade}`,
          `*Rescheduled Showed:* ${rescShown}`,
          `*Follow Up Calls Booked:* ${fuSched}`,
          `*Follow Up Calls Shown:* ${fuShown}`,
          `*Deals Closed:* ${closed}`,
          `*Cash Collected:* $${cash.toLocaleString()}`,
          `*Revenue:* $${revenue.toLocaleString()}`,
        ].join("\n");

        const msg = {
          text: `New Closer EOD — ${body.name} (${body.team})`,
          blocks: [
            {
              type: "section",
              text: { type: "mrkdwn", text: lines },
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
