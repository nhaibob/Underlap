// src/app/api/user/[username]/followers/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET - Get list of followers for a user
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

    // Get followers with their profiles
    const { data: followers, error } = await supabase
      .from("follows")
      .select(
        `
        id,
        created_at,
        follower:follower_id (
          id,
          username,
          name,
          avatar_url
        )
      `,
      )
      .eq("following_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Followers fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch followers" },
        { status: 500 },
      );
    }

    // If current user is logged in, check which followers they're following back
    let followingSet = new Set<string>();
    if (currentUserId) {
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      if (following) {
        followingSet = new Set(following.map((f) => f.following_id));
      }
    }

    // Format response
    const formattedFollowers =
      followers?.map((f) => ({
        id: (f.follower as any)?.id,
        username: (f.follower as any)?.username,
        name: (f.follower as any)?.name,
        avatar_url: (f.follower as any)?.avatar_url,
        followedAt: f.created_at,
        isFollowing: currentUserId
          ? followingSet.has((f.follower as any)?.id)
          : false,
      })) || [];

    return NextResponse.json(formattedFollowers);
  } catch (error) {
    console.error("Followers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
