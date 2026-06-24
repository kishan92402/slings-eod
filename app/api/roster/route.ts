import { supabase } from "../../lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  let query = supabase.from("roster").select("*").order("team").order("name");
  if (role) query = query.eq("role", role);
  const { data, error } = await query;
  if (error) return Response.json([], { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { error } = await supabase.from("roster").insert([{ team: body.team, name: body.name, role: body.role ?? "closer" }]);
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}
