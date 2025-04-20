import Container from "@/components/common/Container";
import Banner from "@/components/home/Banner";
import { Navbar } from "@/components/Navbar";
import BookGrid from "@/components/books/BookGrid";
import { mockBooks } from "@/lib/mock-data";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UnderlineLink from "@/components/common/UnderlineLink";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Banner />
      <Container maxWidth="lg" padding="py-8">
        {/* <div className="space-y-12">
          <BookGrid title="Trending Books" books={mockBooks} />
        </div> */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>
                <UnderlineLink className="text-2xl" href="/translate">
                  Dịch máy tiếng trung
                </UnderlineLink>
              </CardTitle>
              <CardDescription>
                Công cụ dịch tiếng trung sang tiếng việt dành cho việc đọc tiểu
                thuyết trung quốc
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Container>
    </>
  );
}
