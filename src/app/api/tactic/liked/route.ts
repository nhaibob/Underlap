// src/app/api/tactic/liked/route.ts
// Trả về danh sách tactics mà user đã like
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/authServer";

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Lấy profile id của user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Lấy danh sách tactic_id mà user đã like
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("tactic_id")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (likesError) {
      console.error("Fetch likes error:", likesError);
      return NextResponse.json(
        { error: "Failed to fetch liked tactics" },
        { status: 500 }
      );
    }

    if (!likes || likes.length === 0) {
      return NextResponse.json([]);
    }

    const tacticIds = likes.map((l) => l.tactic_id).filter(Boolean);

    // Lấy thông tin chi tiết các tactics đã like
    const { data: tactics, error: tacticsError } = await supabase
      .from("tactics")
      .select("*")
      .in("id", tacticIds)
      .eq("is_public", true);

    if (tacticsError) {
      console.error("Fetch liked tactics error:", tacticsError);
      return NextResponse.json(
        { error: "Failed to fetch tactics" },
        { status: 500 }
      );
    }

    // Transform để match frontend format
    const formattedTactics = (tactics || []).map((tactic) => ({
      id: tactic.id,
      title: tactic.title,
      description: tactic.description || "",
      formation: tactic.formation || "4-4-2",
      createdAt: tactic.created_at,
      tags: tactic.tags || [],
      status: "liked",
      author: {
        username: tactic.author_username || "Anonymous",
        name: tactic.author_name || tactic.author_username || "Anonymous",
        avatarUrl: tactic.author_avatar || "/assets/avatars/default.png",
      },
      stats: {
        likes: tactic.likes_count || 0,
        comments: tactic.comments_count || 0,
        views: tactic.views_count || 0,
      },
      tacticData: {
        players: tactic.players || [],
        arrows: tactic.arrows || [],
      },
    }));

    // Sắp xếp theo thứ tự likes (giữ đúng thứ tự đã like)
    const ordered = tacticIds
      .map((id) => formattedTactics.find((t) => t.id === id))
      .filter(Boolean);

    return NextResponse.json(ordered);
  } catch (error) {
    console.error("Liked tactics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
