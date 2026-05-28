// src/app/api/tactic/[id]/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerUser, supabaseAdmin as supabase } from "@/lib/authServer";

export const dynamic = "force-dynamic";

// GET - Check if current user has saved this tactic
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ saved: false });
    }

    const { data, error } = await supabase
      .from("saves")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("tactic_id", params.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Save check error:", error);
      return NextResponse.json({ saved: false });
    }

    return NextResponse.json({ saved: !!data });
  } catch (error) {
    console.error("Save GET error:", error);
    return NextResponse.json({ saved: false });
  }
}

// POST - Save a tactic
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert to handle race conditions
    const { error } = await supabase.from("saves").upsert(
      {
        user_id: authUser.id,
        tactic_id: params.id,
      },
      { onConflict: "user_id,tactic_id" }
    );

    if (error) {
      console.error("Save POST error:", error);
      return NextResponse.json(
        { error: "Failed to save tactic" },
        { status: 500 }
      );
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Save POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Unsave a tactic
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getServerUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("saves")
      .delete()
      .eq("user_id", authUser.id)
      .eq("tactic_id", params.id);

    if (error) {
      console.error("Unsave error:", error);
      return NextResponse.json(
        { error: "Failed to unsave tactic" },
        { status: 500 }
      );
    }

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("Unsave error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
