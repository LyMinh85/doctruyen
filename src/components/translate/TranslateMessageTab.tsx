import { cn, removeBrTags } from "@/lib/utils";
import { TranslationEngine } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings,
  ArrowDown,
  ArrowRight,
  Check,
  Copy,
  Expand,
  Clipboard,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import Container from "../common/Container";
import { useRef, useState } from "react";
import { TranslationService } from "@/services/translate-service";
import { TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

interface TranslateMessageTabProps {
  tabContentVariants: any;
  loadingDict: boolean;
}

export default function TranslateMessageTab({
  tabContentVariants,
}: TranslateMessageTabProps & {
  key: string;
}) {
  const [inputText, setInputText] = useState<string>(``);
  const [translationEngine, setTranslationEngine] = useState<string>(
    TranslationEngine.Vietphrase
  );
  const [fontSize, setFontSize] = useState<number>(16);
  const [outputText, setOutputText] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    // remove all html tab from outputText

    const textWithoutHtml = outputText
      .replaceAll("</p>", "\n")
      .replace(/<[^>]+>/g, "");
    navigator.clipboard.writeText(textWithoutHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
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
                    <div className="flex items-center z-10">
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
                            <h4 className="font-bold text-[#8b7755]">
                              Cài đặt
                            </h4>

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
    </>
  );
}
