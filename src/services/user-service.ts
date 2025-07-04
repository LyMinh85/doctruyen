import { Prisma, PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
  public static async createUser(
    user: Prisma.UserCreateInput
  ): Promise<Prisma.UserCreateInput | { error: string }> {
    try {
      const newUser = await prisma.user.create({
        data: user,
      });

      if (user === null) {
        console.error("User not created");
        return { error: "User not created" };
      }

      return newUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error.message);
      }
      console.error(error);
      return { error: "Internal Server Error" };
    }
  }

  public static async getUserByAuthProviderId(
    authProviderId: string
  ): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          auth_provider_id: authProviderId,
        },
      });

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }
}
