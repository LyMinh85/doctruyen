"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clipboard,
  Copy,
  Expand,
  FileText,
  Globe,
  MessageSquare,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  cn,
  DictionaryFilePath,
  loadDictionaryByNameInClient,
  removeBrTags,
} from "@/lib/utils";
import { TranslationService } from "@/services/translate-service";
import { TranslationEngine } from "@/types";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import Container from "../common/Container";
import { useRouter } from "next/navigation";
import TranslateWebsiteFullscreen from "./TranslateWebsiteFullscreen";

interface TranslationAppProps {
  url?: string;
}

export default function TranslationApp({ url }: TranslationAppProps) {
  const [activeTab, setActiveTab] = useState("text");
  const [inputText, setInputText] = useState<string>(``);
  const [translationEngine, setTranslationEngine] = useState<string>(
    TranslationEngine.Vietphrase
  );
  const [fontSize, setFontSize] = useState<number>(16);
  const [outputText, setOutputText] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingDict, setLoadingDict] = useState(true);
  const textareaRef = useRef(null);
  // File translation state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const handleClickTranslateWebsite = (url: string) => {
    // Implement website translation logic here
    // Add https:// if not present
    if (!url.startsWith("http") && !url.startsWith("https")) {
      router.push(
        `/dich-trung-viet?url=${encodeURIComponent("https://" + url)}`
      );
    } else {
      router.push(`/dich-trung-viet?url=${encodeURIComponent(url)}`);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        if (textareaRef.current) {
          (textareaRef.current as HTMLTextAreaElement).focus();
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard contents:", err);
    }
  };

  useEffect(() => {
    async function loadDictionaries() {
      try {
        const [names, vietphrase, hanViet, luatNhan] = await Promise.all([
          loadDictionaryByNameInClient(DictionaryFilePath.names),
          loadDictionaryByNameInClient(
            DictionaryFilePath.vietphraseQuickTranslator
          ),
          loadDictionaryByNameInClient(DictionaryFilePath.hanViet),
          loadDictionaryByNameInClient(DictionaryFilePath.luatNhan),
        ]);

        TranslationService.loadAllDictionaries({
          onlyName: names,
          vietPhraseOneMeaning: vietphrase,
          hanViet,
          nhanByOneMeaning: luatNhan,
          luatNhan,
        });
      } catch (error) {
        console.error("Failed to load dictionaries:", error);
      } finally {
        setLoadingDict(false);
      }
    }

    if (loadingDict) {
      loadDictionaries();
    }
  }, [loadingDict]);

  const handleTranslate = () => {
    const translatedText = TranslationService.chineseToVietPhraseOneMeaning(
      inputText,
      0,
      1,
      true
    );
    setOutputText(removeBrTags(translatedText.text));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (isFullscreen) {
      document.documentElement.style.overflow = "auto";
    } else {
      document.documentElement.style.overflow = "hidden";
    }
  };

  const handleFileTranslate = () => {
    console.log("Translating file:", selectedFile?.name);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const copyToClipboard = () => {
    // remove all html tab from outputText

    const textWithoutHtml = outputText
      .replaceAll("</p>", "\n")
      .replace(/<[^>]+>/g, "");
    navigator.clipboard.writeText(textWithoutHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  // check if url and valided url
  const isValidUrl = (url: string) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])?)\\.)+([a-z]{2,}|[a-z\\d-]{2,}))" + // domain name
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );
    return !!pattern.test(url);
  };

  if (url && isValidUrl(url)) {
    return (
      <TranslateWebsiteFullscreen
        url={url}
        handleClickTranslate={handleClickTranslateWebsite}
        loadingDict={loadingDict}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center p-4 md:p-8">
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-[#f8f5f0] flex flex-col pt-4 md:pt-8"
          >
            <Container
              maxWidth="lg"
              className="w-full h-full flex flex-col px-0"
            >
              <div className="flex justify-between items-center mb-4 px-6 md:px-0">
                <h2 className="text-xl font-bold text-[#8b7755]">
                  Tiếng Trung
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div
                className="text-justify flex-1 p-6 rounded-t-2xl bg-[#f0ebe2] overflow-auto border border-[#d9cfc1]"
                style={{
                  fontSize: `${fontSize}px`,
                }}
                dangerouslySetInnerHTML={{
                  __html: outputText,
                }}
              ></div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-[#8b7755] mb-6 md:mb-8"
      >
        Dịch tiếng Trung sang tiếng Việt
      </motion.h1>

      <div className="hidden">
        <h2>Công cụ dịch thông minh</h2>
        <p className="text-gray-600 mb-6">
          Dịch máy tiếng Trung sang tiếng Việt miễn phí, nhanh chóng, không cần
          đăng ký. Phù hợp cho việc đọc tiểu thuyết Trung Quốc.
        </p>
        <h2>Làm sao để dịch nhanh?</h2>
      </div>

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
            {/* Text Translation Tab */}
            {activeTab === "text" && (
              <TranslateMessageTab
                key="text-tab"
                tabContentVariants={tabContentVariants}
                inputText={inputText}
                setInputText={setInputText}
                outputText={outputText}
                setOutputText={setOutputText}
                translationEngine={translationEngine}
                setTranslationEngine={setTranslationEngine}
                fontSize={fontSize}
                setFontSize={setFontSize}
                handlePaste={handlePaste}
                handleTranslate={handleTranslate}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                copied={copied}
                copyToClipboard={copyToClipboard}
              />
            )}

            {/* Website Translation Tab */}
            {activeTab === "website" && (
              <TranslateWebsiteTab
                key="website-tab"
                tabContentVariants={tabContentVariants}
                translationEngine={translationEngine}
                setTranslationEngine={setTranslationEngine}
                handleWebsiteTranslate={handleClickTranslateWebsite}
              />
            )}

            {/* File Translation Tab */}
            {activeTab === "file" && (
              <TranslateFileTab
                key="file-tab"
                tabContentVariants={tabContentVariants}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                handleFileDrop={handleFileDrop}
                handleFileSelect={handleFileSelect}
                translationEngine={translationEngine}
                setTranslationEngine={setTranslationEngine}
                handleFileTranslate={handleFileTranslate}
              />
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}

interface TranslateMessageTabProps {
  tabContentVariants: any;
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  translationEngine: string;
  setTranslationEngine: (engine: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  handlePaste: () => void;
  handleTranslate: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  copied: boolean;
  copyToClipboard: () => void;
}

function TranslateMessageTab({
  tabContentVariants,
  inputText,
  setInputText,
  outputText,
  setOutputText,
  translationEngine,
  setTranslationEngine,
  fontSize,
  setFontSize,
  handlePaste,
  handleTranslate,
  isFullscreen,
  toggleFullscreen,
  copied,
  copyToClipboard,
}: TranslateMessageTabProps & {
  key: string;
}) {
  return (
    <motion.div
      key="text-tab"
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <TabsContent value="text" className="mt-0">
        <div
          className={cn(
            "flex flex-col lg:flex-row gap-6",
            isFullscreen ? "overflow-hidden" : "overflow-auto"
          )}
        >
          {/* Left Column - Input */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <Card className="shadow-sm border-[#d9cfc1] h-auto">
              <CardContent className="pt-6 h-auto">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-lg font-bold text-[#8b7755]">
                    Tiếng trung
                  </Label>
                  <div className="flex items-center">
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

                          <div className="space-y-2">
                            <Label className="text-[#8b7755]">
                              Công nghệ dịch
                            </Label>
                            <Select
                              value={translationEngine}
                              onValueChange={setTranslationEngine}
                            >
                              <SelectTrigger className="border-[#d9cfc1] focus:ring-[#8b7755]">
                                <SelectValue placeholder="Select engine" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(TranslationEngine).map(
                                  (engine) => (
                                    <SelectItem key={engine} value={engine}>
                                      {engine}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[#8b7755]">
                              Font Size: <span>{fontSize}px</span>
                            </Label>
                            <Slider
                              value={[fontSize]}
                              min={12}
                              max={24}
                              step={1}
                              onValueChange={(value) => setFontSize(value[0])}
                              className="py-2"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                      onClick={handlePaste}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="relative h-full">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập văn bản tiếng Trung ở đây..."
                    className="min-h-[300px] h-full resize-none border-[#d9cfc1] focus-visible:ring-[#8b7755]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Translate Button (visible only on mobile) */}
          <div className="lg:hidden w-full my-4 flex justify-center">
            <Button
              className="w-full bg-[#a08e6c] hover:bg-[#8b7755] text-white flex items-center justify-center gap-2 py-6"
              onClick={() => handleTranslate()}
            >
              <span>Dịch</span>
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Center - Translate Button (visible only on desktop) */}
          <div className="hidden lg:flex items-center justify-center self-start mt-10">
            <Button
              className="bg-[#a08e6c] hover:bg-[#8b7755] text-white flex items-center justify-center gap-2"
              onClick={handleTranslate}
            >
              <span>Dịch</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Column - Output */}
          <div className="w-full lg:w-1/2">
            <Card className="h-full shadow-sm border-[#d9cfc1]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-bold text-[#8b7755]">
                    Tiếng việt
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 w-8 p-0 hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                    >
                      {copied ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="h-8 w-8 p-0 hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                    >
                      <Expand className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-[#f0ebe2] min-h-[300px] h-full whitespace-pre-line"
                  style={{
                    fontSize: `${fontSize}px`,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: outputText,
                  }}
                ></motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </motion.div>
  );
}

interface TranslateWebsiteTabProps {
  tabContentVariants: any;
  translationEngine: string;
  setTranslationEngine: (engine: string) => void;
  handleWebsiteTranslate: (url: string) => void;
}

function TranslateWebsiteTab({
  tabContentVariants,
  translationEngine,
  setTranslationEngine,
  handleWebsiteTranslate,
}: TranslateWebsiteTabProps & {
  key: string;
}) {
  const [websiteUrl, setWebsiteUrl] = useState("");

  return (
    <motion.div
      key="website-tab"
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <TabsContent value="website" className="mt-0">
        <Card className="shadow-sm border-[#d9cfc1]">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium text-[#8b7755]">
                  Website URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="flex-1 border-[#d9cfc1] focus-visible:ring-[#8b7755]"
                  />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="bg-[#a08e6c] hover:bg-[#8b7755] text-white"
                      onClick={() => handleWebsiteTranslate(websiteUrl)}
                    >
                      Dịch
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#8b7755]">Công nghệ dịch</Label>
                  <Select
                    value={translationEngine}
                    onValueChange={setTranslationEngine}
                  >
                    <SelectTrigger className="border-[#d9cfc1] focus:ring-[#8b7755]">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TranslationEngine).map((engine) => (
                        <SelectItem key={engine} value={engine}>
                          {engine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-[#f0ebe2] rounded-xl p-6 text-center border border-[#d9cfc1]">
                <Globe className="h-12 w-12 mx-auto text-[#a08e6c] mb-3" />
                <h3 className="text-lg font-medium text-[#8b7755] mb-1">
                  Website Translation
                </h3>
                <p className="text-[#8b7755]/70 max-w-md mx-auto">
                  Enter a URL above to translate an entire website from Chinese
                  to Vietnamese.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </motion.div>
  );
}

interface TranslateFileTabProps {
  tabContentVariants: any;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  translationEngine: string;
  setTranslationEngine: (engine: string) => void;
  handleFileTranslate: () => void;
}

function TranslateFileTab({
  tabContentVariants,
  selectedFile,
  setSelectedFile,
  isDragging,
  setIsDragging,
  handleFileDrop,
  handleFileSelect,
  translationEngine,
  setTranslationEngine,
  handleFileTranslate,
}: TranslateFileTabProps & {
  key: string;
}) {
  return (
    <motion.div
      key="file-tab"
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <TabsContent value="file" className="mt-0">
        <Card className="shadow-sm border-[#d9cfc1]">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? "border-[#8b7755] bg-[#f0ebe2]"
                    : "border-[#d9cfc1] hover:border-[#a08e6c]"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
              >
                <Upload className="h-10 w-10 mx-auto text-[#a08e6c] mb-3" />
                <h3 className="text-lg font-medium text-[#8b7755] mb-1">
                  {selectedFile ? selectedFile.name : "Upload a file"}
                </h3>
                <p className="text-[#8b7755]/70 mb-4">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                    : "Drag and drop a file here, or click to browse"}
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="mx-auto border-[#d9cfc1] hover:bg-[#f0ebe2] hover:text-[#8b7755] hover:border-[#8b7755]"
                >
                  Browse Files
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#8b7755]">Công nghệ dịch</Label>
                  <Select
                    value={translationEngine}
                    onValueChange={setTranslationEngine}
                  >
                    <SelectTrigger className="border-[#d9cfc1] focus:ring-[#8b7755]">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TranslationEngine).map((engine) => (
                        <SelectItem key={engine} value={engine}>
                          {engine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-[#a08e6c] hover:bg-[#8b7755] text-white"
                  onClick={handleFileTranslate}
                  disabled={!selectedFile}
                >
                  Translate File
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </motion.div>
  );
}
