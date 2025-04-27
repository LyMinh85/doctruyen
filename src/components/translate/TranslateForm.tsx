"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Globe, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useRouter } from "next/navigation";
import TranslateWebsiteFullscreen from "./TranslateWebsiteFullscreen";
import TranslateMessageTab from "./TranslateMessageTab";
import TranslateWebsiteTab from "./TranslateWebsiteTab";
import TranslateFileTab from "./TranslateFileTab";
import { useDictionaries } from "@/hooks/use-dictionaries";

interface TranslationAppProps {
  url?: string;
}

// Tab type for improved type safety
type TabType = "text" | "website" | "file";

// Animation variants defined outside component to prevent unnecessary recreations
const tabContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function TranslationApp({ url }: TranslationAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const router = useRouter();
  const { isLoading, error } = useDictionaries();

  // URL validation is now a utility function
  const isValidUrl = useCallback((urlToCheck: string): boolean => {
    try {
      // Using URL constructor for more reliable validation
      new URL(
        urlToCheck.startsWith("http") ? urlToCheck : `https://${urlToCheck}`
      );
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const handleClickTranslateWebsite = useCallback(
    (websiteUrl: string): void => {
      // Normalize URL before redirection
      const normalizedUrl = websiteUrl.startsWith("http")
        ? websiteUrl
        : `https://${websiteUrl}`;

      router.push(`/dich-trung-viet?url=${encodeURIComponent(normalizedUrl)}`);
    },
    [router]
  );

  const handleTabChange = useCallback((value: string): void => {
    setActiveTab(value as TabType);
  }, []);

  // Dictionary loading logic is now more robust
  // useEffect(() => {
  //   async function loadDictionaries() {
  //     try {
  //       const [names, vietphrase, hanViet, luatNhan] = await Promise.all([
  //         loadDictionaryByNameInClient(DictionaryFilePath.names),
  //         loadDictionaryByNameInClient(
  //           DictionaryFilePath.vietphraseQuickTranslator
  //         ),
  //         loadDictionaryByNameInClient(DictionaryFilePath.hanViet),
  //         loadDictionaryByNameInClient(DictionaryFilePath.luatNhan),
  //       ]);

  //       TranslationService.loadAllDictionaries({
  //         onlyName: names,
  //         vietPhraseOneMeaning: vietphrase,
  //         hanViet,
  //         nhanByOneMeaning: luatNhan,
  //         luatNhan,
  //       });

  //       toast({
  //         title: "Từ điển đã được tải thành công",
  //         variant: "default",
  //       });
  //       setDictionaryError(null);
  //     } catch (error) {
  //       console.error("Failed to load dictionaries:", error);
  //       setDictionaryError("Không thể tải từ điển. Vui lòng tải lại trang.");
  //       toast({
  //         title: "Lỗi",
  //         description: "Không thể tải từ điển. Vui lòng tải lại trang.",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setLoadingDict(false);
  //     }
  //   }

  //   if (loadingDict) {
  //     loadDictionaries();
  //   }
  // }, [loadingDict]);

  // Special case: Website translation view with URL parameter
  if (url && isValidUrl(url)) {
    return (
      <TranslateWebsiteFullscreen
        url={url}
        handleClickTranslate={handleClickTranslateWebsite}
        loadingDict={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-[#8b7755] mb-6 md:mb-8"
      >
        Dịch tiếng Trung sang tiếng Việt
      </motion.h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-800 rounded-md w-full max-w-6xl"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-6xl"
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#f0ebe2] p-1">
            <TabsTrigger
              value="text"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#8b7755] data-[state=active]:shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Dịch văn bản</span>
            </TabsTrigger>
            <TabsTrigger
              value="website"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#8b7755] data-[state=active]:shadow-sm"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Dịch website</span>
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#8b7755] data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Dịch file</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "text" && (
              <TranslateMessageTab
                key="text-tab"
                tabContentVariants={tabContentVariants}
                loadingDict={isLoading}
              />
            )}

            {activeTab === "website" && (
              <TranslateWebsiteTab
                key="website-tab"
                tabContentVariants={tabContentVariants}
                handleWebsiteTranslate={handleClickTranslateWebsite}
              />
            )}

            {activeTab === "file" && (
              <TranslateFileTab
                key="file-tab"
                tabContentVariants={tabContentVariants}
              />
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
