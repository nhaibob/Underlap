// src/app/api/tactic/[id]/like/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, supabaseAdmin as supabase } from "@/lib/authServer";

// POST: Add like
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up username from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", authUser.id)
      .single();

    const { data, error } = await supabase
      .from("likes")
      .insert({
        tactic_id: params.id,
        user_id: authUser.id,
        user_username: profile?.username || authUser.username || "Anonymous",
      })
      .select()
      .single();

    if (error) {
      // If already liked, return success anyway
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already liked" });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove like
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("tactic_id", params.id)
      .eq("user_id", authUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unlike error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Check if user liked
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ liked: false });
    }

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("tactic_id", params.id)
      .eq("user_id", authUser.id)
      .single();

    return NextResponse.json({ liked: !!data });
  } catch (error) {
    return NextResponse.json({ liked: false });
  }
}
