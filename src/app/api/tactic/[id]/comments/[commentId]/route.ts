// src/app/api/tactic/[id]/comments/[commentId]/route.ts
import { NextResponse } from "next/server";
import { getServerUser, supabaseAdmin as supabase } from "@/lib/authServer";

// PATCH: Update a comment
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; commentId: string } },
) {
  try {
    const authUser = await getServerUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // Verify user owns the comment
    const { data: existing } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", params.commentId)
      .single();

    if (!existing || existing.user_id !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("comments")
      .update({ content: content.trim() })
      .eq("id", params.commentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Update comment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } },
) {
  try {
    const authUser = await getServerUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the comment
    const { data: existing } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", params.commentId)
      .single();

    if (!existing || existing.user_id !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", params.commentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
