import { signUpFormSchema } from "@/schemas/sign-up-form-schema";
import { UserService } from "@/services/user-service";
import bcrypt from "bcrypt";
import { createClerkClient } from "@clerk/backend";
import { DEFAULT_AVATAR_URL } from "@/lib/utils";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
const saltRounds = 10;

export async function POST(request: Request) {
  const body = await request.json();

  console.log(body);

  const validatedData = signUpFormSchema.parse(body);

  if ("error" in validatedData) {
    return Response.json({ error: validatedData.error }, { status: 400 });
  }
  const clerkUser = await clerkClient.users.getUser(body.authProviderId);
  const passwordHash = bcrypt.hashSync(validatedData.password, saltRounds);
  const newUser = await UserService.createUser({
    username: validatedData.username,
    email: validatedData.email,
    password: passwordHash,
    gender: validatedData.gender,
    avatar_url: clerkUser.imageUrl || DEFAULT_AVATAR_URL,
    auth_provider_id: body.authProviderId,
    auth_provider: body.authProvider,
  });
  if ("error" in newUser) {
    return Response.json({ error: newUser.error }, { status: 400 });
  }

  return Response.json(newUser, { status: 201 });
}
