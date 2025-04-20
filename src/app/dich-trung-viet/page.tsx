import TranslationApp from "@/components/translate/TranslateForm";
import { Head } from "next/document";

export const metadata = {
  title: "Dịch máy tiếng Trung sang tiếng Việt online | doctruyen",
  description:
    "Dịch máy (convert) tiếng Trung sang tiếng Việt miễn phí, nhanh chóng, không cần đăng ký. Phù hợp cho việc đọc tiểu thuyết Trung Quốc.",
  keywords: [
    "dịch tiếng Trung",
    "dịch tiếng Trung sang tiếng Việt",
    "công cụ dịch máy",
    "dịch truyện Trung Quốc",
    "dịch tiểu thuyết Trung Quốc",
    "dịch truyện chữ",
    "dịch truyện online",
  ],
  openGraph: {
    title: "Dịch máy tiếng Trung sang tiếng Việt online | doctruyen",
    description:
      "Dịch tiếng Trung sang tiếng Việt miễn phí, nhanh chóng. Công cụ dịch máy lý tưởng cho tiểu thuyết Trung Quốc.",
    url: "https://doctruyen.space/dich-trung-viet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dịch máy tiếng Trung sang tiếng Việt online | doctruyen",
    description:
      "Công cụ dịch máy tiếng Trung sang tiếng Việt miễn phí, nhanh chóng, không cần đăng ký.",
  },
  alternates: {
    canonical: "https://doctruyen.space/translate",
  },
};

export default function TranslatePage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "doctruyen Translation Tool",
    applicationCategory: "Utility",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    description:
      "Free online Chinese to Vietnamese translation tool for novels and texts.",
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Head>
      <TranslationApp />
    </>
  );
}
