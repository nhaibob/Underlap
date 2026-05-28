// src/app/api/tactic/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getServerUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET: Fetch a single tactic by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from("tactics")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Tactic not found" },
          { status: 404 },
        );
      }
      throw error;
    }

    // Increment view count
    await supabase
      .from("tactics")
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq("id", params.id);

    // Transform to match frontend format
    const tactic = {
      id: data.id,
      title: data.title,
      description: data.description,
      formation: data.formation,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status,
      is_public: data.is_public,
      author: {
        id: data.author_id,
        username: data.author_username,
        name: data.author_name,
        avatarUrl: data.author_avatar,
      },
      stats: {
        likes: data.likes_count || 0,
        comments: data.comments_count || 0,
        views: data.views_count || 0,
        forks: 0,
      },
      tacticData: {
        players: data.players || [],
        arrows: data.arrows || [],
      },
      tags: data.tags || [],
      isPublic: data.is_public,
    };

    return NextResponse.json(tactic);
  } catch (error: any) {
    console.error("Fetch tactic error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update a tactic
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getServerUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { title, description, players, arrows, isPublic, status } = body;

    // Update the tactic (only owner can update)
    const { data, error } = await supabase
      .from("tactics")
      .update({
        title,
        description,
        players,
        arrows,
        is_public: isPublic,
        status: status || undefined, // Only update if provided
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("author_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update tactic error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tactic: data });
  } catch (error: any) {
    console.error("Update tactic error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a tactic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getServerUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const { error } = await supabase
      .from("tactics")
      .delete()
      .eq("id", params.id)
      .eq("author_id", userId);

    if (error) {
      console.error("Delete tactic error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete tactic error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
