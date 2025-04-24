"use client";
import { TranslationService } from "@/services/translate-service";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useRef, useState } from "react";
import Container from "../common/Container";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useSearchParams } from "next/navigation";

interface TranslateWebsiteFullscreenProps {
  url: string;
  handleClickTranslate: (url: string) => void;
  loadingDict: boolean;
}

export default function TranslateWebsiteFullscreen({
  url,
  handleClickTranslate,
  loadingDict,
}: TranslateWebsiteFullscreenProps) {
  // State for the original HTML content
  const [sourceHtml, setSourceHtml] = useState<string>("");
  // State for the translated HTML content (used in srcDoc)
  const [translatedHtml, setTranslatedHtml] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>(url || "");
  const router = useRouter();
  const searchParams = useSearchParams(); // -> URLSearchParams object
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch(
          "/api/proxy?url=" + encodeURIComponent(websiteUrl)
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
      <Card className="shadow-sm border-[#d9cfc1] bg-[#f8f5f0] h-[50px] z-[10000]">
        <Container className="flex justify-center items-center h-full space-x-4">
          {/* arrow go-back */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#f0ebe2] hover:text-[#8b7755]"
            onClick={() => window.history.back()}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Button>

          <h1 className="text-lg font-bold text-[#8b7755]">
            <Link href="/dich-trung-viet">Doctruyen</Link>
          </h1>

          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1 border-[#d9cfc1] focus-visible:ring-[#8b7755] bg-white"
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="bg-[#a08e6c] hover:bg-[#8b7755] text-white"
                onClick={() => handleClickTranslate(websiteUrl)}
              >
                Dịch
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
      {loadingDict ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#8b7755]">Loading...</p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          srcDoc={translatedHtml}
          className="w-full h-[calc(100vh-50px)]"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}
