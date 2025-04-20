import Container from "@/components/common/Container";
import Banner from "@/components/home/Banner";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
                <UnderlineLink className="text-xl" href="/dich-trung-viet">
                  Dịch máy tiếng Trung sang tiếng Việt
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
