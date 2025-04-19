import {
  PrismaClient,
  Book,
  BookVisibility,
  BookStatus,
  BookType,
} from "@prisma/client";

const prisma = new PrismaClient();

class BookService {
  static async getBooks(
    filters: Partial<Book> = {},
    pagination: { skip: number; take: number } = { skip: 0, take: 10 }
  ): Promise<Book[]> {
    try {
      const books = await prisma.book.findMany({
        where: {
          visibility: "PUBLIC", // Chỉ lấy sách công khai
          ...filters,
        },
        include: {
          user: {
            select: { id: true, username: true },
          },
          BookCategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      });

      return books;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw new Error("Failed to fetch books");
    }
  }

  static async createBook(
    bookData: {
      title: string;
      author: string;
      description?: string;
      cover_url: string;
      user_id: number;
      status?: BookStatus;
      visibility?: BookVisibility;
      is_vip?: boolean;
      type?: BookType;
      cost?: number;
    },
    categoryIds: number[] = []
  ): Promise<Book | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create the book
        const book = await tx.book.create({
          data: {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            cover_url: bookData.cover_url,
            status: bookData.status || "ON_GOING",
            visibility: bookData.visibility || "PRIVATE",
            is_vip: bookData.is_vip || false,
            type: bookData.type || "ORIGINAL",
            cost: bookData.cost || 0,
            user: {
              connect: { id: bookData.user_id },
            },
          },
        });

        // Create book category connections if provided
        if (categoryIds.length > 0) {
          await tx.bookCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              book_id: book.id,
              category_id: categoryId,
            })),
          });
        }

        // Return the created book with associated categories
        return tx.book.findUnique({
          where: { id: book.id },
          include: {
            user: {
              select: { id: true, username: true },
            },
            BookCategory: {
              include: {
                category: true,
              },
            },
          },
        });
      });
    } catch (error) {
      console.error("Error creating book:", error);
      throw new Error("Failed to create book");
    }
  }
}

export default BookService;
