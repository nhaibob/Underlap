// src/app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getServerUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET: Fetch user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update user profile
export async function PUT(request: Request) {
  try {
    const authUser = await getServerUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, avatar_url, location, website } = await request.json();

    // Get the user's own profile username
    const { data: ownProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", authUser.id)
      .single();

    if (!ownProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        name,
        bio,
        avatar_url,
        location,
        website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
