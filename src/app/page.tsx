import Container from "@/components/common/Container";
import Banner from "@/components/home/Banner";
import { Navbar } from "@/components/Navbar";
import BookGrid from "@/components/books/BookGrid";
import { mockBooks } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Banner />
      <Container maxWidth="lg" padding="py-8">
        <div className="space-y-12">
          <BookGrid title="Trending Books" books={mockBooks} />
        </div>
      </Container>
    </>
  );
}
