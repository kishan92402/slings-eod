import { supabase } from "../../lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("roster").select("*").order("team").order("name");
  if (error) return Response.json([], { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { error } = await supabase.from("roster").insert([{ team: body.team, name: body.name }]);
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}
