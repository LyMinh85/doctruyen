import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // try {
  //   const res = await request.json();
  //   const user = await prisma.user.create({
  //     data: {
  //       email: res.email,
  //       password: res.password,
  //     },
  //   });

  //   if (user === null) {
  //     console.error('User not created');
  //   }

  //   return Response.json(user, { status: 201 });
  // } catch (error) {
  //   if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //     console.error(error.message);
  //   }
  //   return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  // }
}
