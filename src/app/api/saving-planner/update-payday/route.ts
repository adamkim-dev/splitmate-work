import { NextRequest, NextResponse } from "next/server";
import { SplitSBClient } from "@/app/utils/supabase/SplitSBClient";

class UsersClient extends SplitSBClient {
  updatePayday = (userId: string, payday: number) => {
    return this.client.from("users").update({ payday }).eq("id", userId);
  };
}
const client = new UsersClient();

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const payday: number | undefined = body?.payday;

    if (typeof payday !== "number" || payday < 1 || payday > 31) {
      return NextResponse.json(
        { error: "Payday must be between 1 and 31" },
        { status: 400 }
      );
    }

    const { error } = await client.updatePayday(userId, payday);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
