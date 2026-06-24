import { supabase } from "../../lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .order("submittedAt", { ascending: true })
      .limit(10000);

    if (error) throw error;

    return Response.json(data ?? []);
  } catch (err) {
    console.error("Failed to fetch responses:", err);
    return Response.json([], { status: 500 });
  }
}
