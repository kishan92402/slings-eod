import { supabase } from "../../lib/supabase";

export async function GET() {
  try {
    const allData: unknown[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .order("submittedAt", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allData.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    return Response.json(allData);
  } catch (err) {
    console.error("Failed to fetch responses:", err);
    return Response.json([], { status: 500 });
  }
}
