// src/app/api/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { getAuthUser, supabaseAdmin as supabase } from "@/lib/authServer";

// GET - Get unread notification count (separated by type)
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const userId = authUser?.id;

    if (!userId) {
      return NextResponse.json({ count: 0, messageCount: 0 });
    }

    // Get total unread count (excluding messages)
    const { count: activityCount, error: activityError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .neq("type", "message");

    // Get unread message count separately
    const { count: messageCount, error: messageError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .eq("type", "message");

    if (activityError || messageError) {
      console.error("Count error:", activityError || messageError);
      return NextResponse.json({ count: 0, messageCount: 0 });
    }

    return NextResponse.json({
      count: activityCount || 0,
      messageCount: messageCount || 0,
    });
  } catch (error) {
    console.error("Unread count error:", error);
    return NextResponse.json({ count: 0, messageCount: 0 });
  }
}
