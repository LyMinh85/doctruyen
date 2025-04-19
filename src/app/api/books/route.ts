import { UserService } from "@/services/user-service";
import BookService from "@/services/book-service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { BookStatus, BookType, BookVisibility } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "content-type": "application/json",
      },
    });
  } 
  
  const user = await UserService.getUserByAuthProviderId(clerkUserId);

  if (!user) {
    return new NextResponse("User not found", {
      status: 404,
      headers: {
        "content-type": "application/json",
      },
    });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;
  const take = limit;
  const filters = {
    user_id: user.id,
    visibility: BookVisibility.PUBLIC,
  };
  const books = await BookService.getBooks(filters, { skip, take });
  // const totalBooks = await BookService.getTotalBooks(filters);
  // const totalPages = Math.ceil(totalBooks / limit);
  // const hasNextPage = page < totalPages;
  // const hasPreviousPage = page > 1;
  // const nextPage = hasNextPage ? page + 1 : null;
  // const previousPage = hasPreviousPage ? page - 1 : null;
  const response = {
    books,
    pagination: {
      // total: totalBooks,
      page,
      limit,
      // totalPages,
      // hasNextPage,
      // hasPreviousPage,
      // nextPage,
      // previousPage,
    },
  };
  return NextResponse.json(response, {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await UserService.getUserByAuthProviderId(clerkUserId);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  try {
    const { title, author, description, cover_url, status, visibility, is_vip, type, cost, categoryIds } = await req.json();

    const book = await BookService.createBook(
      {
        title,
        author,
        description,
        cover_url,
        user_id: user.id,
        status,
        visibility,
        is_vip,
        type,
        cost
      },
      categoryIds || []
    );

    return NextResponse.json({
      message: "Book created successfully",
      book
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json({
      message: "Failed to create book",
      error: (error as Error).message
    }, { status: 500 });
  }
}
