// src/app/api/user/search/route.ts
// Tìm kiếm người dùng theo username hoặc name
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/authServer";

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!q || q.length < 1) {
      return NextResponse.json([]);
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, username, name, bio, avatar_url, location, followers_count, following_count, created_at")
      .or(`username.ilike.%${q}%,name.ilike.%${q}%`)
      .order("followers_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("User search error:", error);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 }
      );
    }

    // Lấy số tactics cho mỗi user
    const formatted = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count: tacticsCount } = await supabase
          .from("tactics")
          .select("*", { count: "exact", head: true })
          .eq("author_username", profile.username)
          .eq("is_public", true);

        return {
          id: profile.id,
          username: profile.username,
          name: profile.name || profile.username,
          bio: profile.bio || "",
          avatarUrl: profile.avatar_url || "/assets/avatars/default.png",
          location: profile.location || "",
          followersCount: profile.followers_count || 0,
          tacticsCount: tacticsCount || 0,
        };
      })
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("User search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
