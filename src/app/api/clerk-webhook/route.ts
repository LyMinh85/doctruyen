import { Gender } from "@/enums/gender";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { UserService } from "@/services/user-service";
import { DEFAULT_AVATAR_URL } from "@/lib/utils";
const saltRounds = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "user.created") {
      const user = body.data;

      const randomPassword = Math.random().toString(36).slice(-8);
      const passwordHash = bcrypt.hashSync(randomPassword, saltRounds);
      const newUser = await UserService.createUser({
        username: `${user.first_name} ${user.last_name}`,
        email: user.email_addresses[0].email_address,
        password: passwordHash,
        gender: Gender.Secrecy,
        avatar_url: user.image_url || DEFAULT_AVATAR_URL,
        auth_provider_id: user.id,
        auth_provider: "Clerk",
      });

      if ("error" in newUser) {
        return NextResponse.json({ error: newUser.error }, { status: 400 });
      }

      return NextResponse.json(newUser, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
