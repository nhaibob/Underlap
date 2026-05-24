// src/app/api/user/[username]/following/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET - Get list of users that this user is following
export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  try {
    const username = decodeURIComponent(params.username);
    const authUser = await getAuthUser(request);
    const currentUserId = authUser?.id || null;

    // First get the user's profile ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get users this person is following with their profiles
    const { data: following, error } = await supabase
      .from("follows")
      .select(
        `
        id,
        created_at,
        following:following_id (
          id,
          username,
          name,
          avatar_url
        )
      `,
      )
      .eq("follower_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Following fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch following" },
        { status: 500 },
      );
    }

    // If current user is logged in, check which of these users they're also following
    let followingSet = new Set<string>();
    if (currentUserId) {
      const { data: myFollowing } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      if (myFollowing) {
        followingSet = new Set(myFollowing.map((f) => f.following_id));
      }
    }

    // Format response
    const formattedFollowing =
      following?.map((f) => ({
        id: (f.following as any)?.id,
        username: (f.following as any)?.username,
        name: (f.following as any)?.name,
        avatar_url: (f.following as any)?.avatar_url,
        followedAt: f.created_at,
        isFollowing: currentUserId
          ? followingSet.has((f.following as any)?.id)
          : false,
      })) || [];

    return NextResponse.json(formattedFollowing);
  } catch (error) {
    console.error("Following API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
