// src/app/api/tactic/route.ts
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getServerUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET - Fetch all public tactics for feed
export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const { data: tactics, error } = await supabase
      .from("tactics")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!tactics || tactics.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Transform data to match frontend expected format
    const formattedTactics = tactics.map((tactic) => ({
      id: tactic.id,
      title: tactic.title,
      description: tactic.description,
      formation: tactic.formation,
      createdAt: tactic.created_at,
      tags: tactic.tags || [],
      author: {
        username: tactic.author_username || "Anonymous",
        name: tactic.author_name || tactic.author_username || "Anonymous",
        avatarUrl: tactic.author_avatar || "/assets/avatars/huyson.png",
      },
      stats: {
        likes: tactic.likes_count || 0,
        comments: tactic.comments_count || 0,
        forks: tactic.forks_count || 0,
      },
      tacticData: {
        players: tactic.players || [],
        arrows: tactic.arrows || [],
      },
    }));

    return NextResponse.json(formattedTactics, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new tactic
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.players || !data.arrows || !data.metadata) {
      return NextResponse.json(
        { error: "Missing required data fields (players, arrows, metadata)" },
        { status: 400 },
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        {
          message: "Tactic saved locally (database not configured)",
          tacticId: "local-" + Date.now(),
          receivedData: data,
        },
        { status: 201 },
      );
    }

    // Get authenticated user from NextAuth session
    const authUser = await getServerUser();
    const userId = authUser?.id;
    let authorUsername = data.metadata.authorUsername || "Anonymous";
    let authorName = data.metadata.authorName || "Anonymous";
    let authorAvatar =
      data.metadata.authorAvatar || "/assets/avatars/default.png";

    // If userId is provided, lookup profile to get correct author info
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, name, avatar_url")
        .eq("id", userId)
        .single();

      if (profile) {
        authorUsername = profile.username || authorUsername;
        authorName = profile.name || profile.username || authorName;
        authorAvatar = profile.avatar_url || authorAvatar;
      }
    }

    // Insert tactic with correct author info
    const { data: newTactic, error } = await supabase
      .from("tactics")
      .insert({
        title: data.metadata.title || "Untitled Tactic",
        description: data.metadata.description || null,
        formation: data.metadata.formation || null,
        author_username: authorUsername,
        author_name: authorName,
        author_avatar: authorAvatar,
        players: data.players,
        arrows: data.arrows,
        is_public: data.status !== "draft" && data.metadata.isPublic !== false,
        status: data.status || "published",
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase insert error:", error.message);
      return NextResponse.json(
        {
          message:
            "Tactic saved locally (database error: " + error.message + ")",
          tacticId: "local-" + Date.now(),
          receivedData: data,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        message: "Tactic successfully published!",
        tacticId: newTactic.id,
        tactic: newTactic,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
