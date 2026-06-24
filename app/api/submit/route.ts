import { supabase } from "../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record = { ...body, id: Date.now().toString() };

    const { error } = await supabase.from("responses").insert([record]);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to save response:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
