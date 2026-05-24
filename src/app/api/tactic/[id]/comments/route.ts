// src/app/api/tactic/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET: Fetch comments for a tactic
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("tactic_id", params.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Fetch comments error:", error);
    return NextResponse.json([]);
  }
}

// POST: Add a comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parentId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // Look up user profile for display info
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, name, avatar_url")
      .eq("id", authUser.id)
      .single();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        tactic_id: params.id,
        user_id: authUser.id,
        user_username: profile?.username || authUser.username || "Anonymous",
        user_name:
          profile?.name ||
          profile?.username ||
          authUser.username ||
          "Anonymous",
        user_avatar: profile?.avatar_url || "/assets/avatars/default.png",
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Add comment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
