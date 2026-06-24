import { supabase } from "../../../lib/supabase";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const { error } = await supabase
      .from("responses")
      .update(body)
      .eq("id", params.id);

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to update:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
