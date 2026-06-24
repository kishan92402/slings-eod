import { supabase } from "../../../lib/supabase";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("roster").delete().eq("id", Number(id));
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}
