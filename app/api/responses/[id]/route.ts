import { supabase } from "../../../lib/supabase";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { error } = await supabase
      .from("responses")
      .update(body)
      .eq("id", id);

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to update:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
