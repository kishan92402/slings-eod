import { supabase } from "../../../lib/supabase";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { error } = await supabase.from("followups").update(body).eq("id", id);
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("followups").delete().eq("id", id);
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}
