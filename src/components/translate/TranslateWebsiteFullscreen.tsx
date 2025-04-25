"use client";
import { TranslationService } from "@/services/translate-service";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useRef, useState } from "react";
import Container from "../common/Container";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, ChevronRight, Search, Settings, X } from "lucide-react";
import Link from "next/link";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useSearchParams } from "next/navigation";
import UnderlineLink from "../common/UnderlineLink";

interface TranslateWebsiteFullscreenProps {
  url: string;
  handleClickTranslate: (url: string) => void;
  loadingDict: boolean;
}

const quickLinks = [
  { name: "UU đọc sách - Uukanshu", url: "https://uukanshu.cc/quanben/" },
  { name: "Phiêu thiên - Piaotian", url: "https://www.ptwxz.com/" },
  { name: "SF light novel", url: "https://book.sfacg.com/" },  
];

export default function TranslateWebsiteFullscreen({
  url,
  handleClickTranslate,
  loadingDict,
}: TranslateWebsiteFullscreenProps) {
  const [loadingWebsite, setLoadingWebsite] = useState(false);
  // State for the original HTML content
  const [sourceHtml, setSourceHtml] = useState<string>("");
  // State for the translated HTML content (used in srcDoc)
  const [translatedHtml, setTranslatedHtml] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>(url || "");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // -> URLSearchParams object
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        setLoadingWebsite(true);
        const response = await fetch(
          "/api/proxy?url=" + encodeURIComponent(websiteUrl)
        );
        if (!response.ok) {
          setError("Không thể tải trang web. Vui lòng kiểm tra URL.");
          return;
        }
        const html = await response.text();
        setSourceHtml(html);
        setLoadingWebsite(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching HTML:", error);
        setError("Không thể tải trang web. Vui lòng kiểm tra URL.");
      }
    };

    if (websiteUrl) {
      fetchHtml();
    }
  }, []);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch(
          "/api/proxy?url=" + encodeURIComponent(searchParams.get("url") || "")
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const html = await response.text();
        setSourceHtml(html);
      } catch (error) {
        console.error("Error fetching HTML:", error);
      }
    };

    if (searchParams.has("url")) {
      fetchHtml();
    }
  }, [searchParams]);

  // Effect to handle translation when dictionary is loaded or sourceHtml changes
  useEffect(() => {
    const handleTranslateSrcDoc = () => {
      try {
        const translated = TranslationService.translateHtmlPage(sourceHtml);
        // Inject script to intercept link clicks
        const htmlWithScript = injectLinkInterceptor(translated);
        setTranslatedHtml(htmlWithScript);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedHtml(sourceHtml); // Fallback to original HTML
      }
    };

    // Only translate if dictionary is loaded
    if (!loadingDict) {
      handleTranslateSrcDoc();
    }
  }, [sourceHtml, loadingDict]);

  // Function to inject script for intercepting link clicks
  const injectLinkInterceptor = (html: string): string => {
    const script = `
      <script>
        document.addEventListener('click', (event) => {
          const link = event.target.closest('a');
          if (link && link.href) {
            event.preventDefault();
            window.parent.postMessage({ type: 'navigate', url: link.href }, '*');
          }
        });
      </script>
    `;
    // Insert script before closing </body> or at the end
    const bodyCloseIndex = html.toLowerCase().lastIndexOf("</body>");
    if (bodyCloseIndex !== -1) {
      return (
        html.slice(0, bodyCloseIndex) + script + html.slice(bodyCloseIndex)
      );
    }
    return html + script;
  };

  // // Handle navigation messages from iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "navigate" && event.data.url) {
        const url = event.data.url;
        try {
          router.push(`/dich-trung-viet?url=${encodeURIComponent(url)}`);
        } catch (error) {
          console.error("Error fetching new content:", error);
          // Optionally handle relative links or fallback
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="h-screen" ref={screenRef}>
      <Card className="rounded-none rounded-b-xl shadow-sm border-[#d9cfc1] bg-[#f8f5f0] h-[50px] z-[10000]">
        <Container className="flex justify-center items-center h-full space-x-4">
          <h1 className="text-lg font-bold text-[#8b7755]">
            <Link href="/dich-trung-viet">Doctruyen</Link>
          </h1>

          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              // on hit enter
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleClickTranslate(websiteUrl);
                }
              }}
              className="flex-1 border-[#d9cfc1] focus-visible:ring-[#8b7755] bg-white"
            />
            {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="bg-[#a08e6c] hover:bg-[#8b7755] text-white"
                onClick={() => handleClickTranslate(websiteUrl)}
              >
                Dịch
              </Button>
            </motion.div> */}
            {/* Search icon button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-[#f0ebe2] hover:text-[#8b7755]"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-bold text-[#8b7755]">Cài đặt</h4>
              </div>
            </PopoverContent>
          </Popover>
        </Container>
      </Card>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md w-full">
          {error}
        </div>
      )}
      {loadingDict || loadingWebsite ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#8b7755]">Đang tải...</p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          srcDoc={translatedHtml}
          className="w-full h-[calc(100vh-50px)]"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
      <FullscreenSearchOverlay
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        handleClickTranslate={handleClickTranslate}
      />
    </div>
  );
}

interface FullscreenSearchOverlayProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  handleClickTranslate: (url: string) => void;
}

function FullscreenSearchOverlay({
  isSearchOpen,
  setIsSearchOpen,
  handleClickTranslate
}: FullscreenSearchOverlayProps) {
  const [searchUrl,  setSearchUrl] = useState<string>("");

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-[#f0ebe2] bg-opacity-90 backdrop-blur-sm p-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <div className="container mx-auto px-6 py-4 flex justify-end">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-[#8b7755] hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="container mx-auto px-6 pt-4">
            <div className="flex items-center border-[#d9cfc1] focus-visible:ring-[#8b7755] bg-white rounded-lg px-4 py-2">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Tìm kiếm"
                className="bg-transparent border-none outline-none text-[#8b7755] w-full text-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleClickTranslate(searchUrl);
                    setIsSearchOpen(false);
                  }
                }}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-[#8b7755] text-sm font-bold mb-4">
                Liên Kết Nhanh
              </h3>
              <ul className="space-y-4">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.05,
                      duration: 0.3,
                    }}
                    className="flex items-center text-[#8b7755]"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />

                    <UnderlineLink
                      href={`/dich-trung-viet?url=${encodeURIComponent(
                        link.url
                      )}`}
                      className="l flex items-center font-black text-[#8b7755] hover:text-[#8b7755] transition-colors"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <span>
                        {link.name} {`(${link.url})`}
                      </span>
                    </UnderlineLink>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
