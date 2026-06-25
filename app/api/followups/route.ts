import { supabase } from "../../lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");
  let query = supabase.from("followups").select("*").order("next_followup_date", { ascending: true });
  if (team) query = query.eq("team", team);
  const { data, error } = await query;
  if (error) return Response.json([], { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const record = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  const { error } = await supabase.from("followups").insert([record]);
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}
