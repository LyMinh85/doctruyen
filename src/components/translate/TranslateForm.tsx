"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clipboard, Expand, Minimize, X } from "lucide-react";
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
  DictFilePath,
  loadDictionaryByNameInClient,
  removeBrTags,
} from "@/lib/utils";
import { TranslationService } from "@/services/translate-service";
import { TranslationEngine, TranslationType } from "@/types";
import Container from "../common/Container";

export default function TranslationApp() {
  const [inputText, setInputText] = useState<string>(``);
  const [translationType, setTranslationType] = useState<string>(
    TranslationType.Vietnamese
  );
  const [translationEngine, setTranslationEngine] = useState<string>(
    TranslationEngine.RuleBaseMT
  );
  const [fontSize, setFontSize] = useState<number>(16);
  const [outputText, setOutputText] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingDict, setLoadingDict] = useState(true);
  const textareaRef = useRef(null);

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
          loadDictionaryByNameInClient(DictFilePath.compressedNames),
          loadDictionaryByNameInClient(
            DictFilePath.compressedVietphraseQuickTranslator
          ),
          loadDictionaryByNameInClient(DictFilePath.hanViet),
          loadDictionaryByNameInClient(DictFilePath.luatNhan),
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
    console.log("Translated Text:", translatedText);
    setOutputText(removeBrTags(translatedText.text));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center p-4 md:p-8">
      <AnimatePresence>
        {isFullscreen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-[#f8f5f0] flex flex-col p-4 md:p-8"
          >
            <Container maxWidth="lg" className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#8b7755]">
                  {translationType}
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
                className="flex-1 p-6 rounded-2xl bg-[#f0ebe2] overflow-auto"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{
                  __html: outputText,
                }}
              ></div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold text-[#8b7755] mb-6 md:mb-10"
      >
        Dịch tiếng trung
      </motion.h1>

      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Input and Options */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            {/* Input Section */}
            <Card className="mb-6 border-[#d9cfc1] shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#8b7755]">
                  Tiếng trung
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập văn bản tiếng Trung ở đây..."
                  className="min-h-[200px] resize-y border-[#d9cfc1] focus-visible:ring-[#8b7755]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-8 right-8 bg-white border-[#d9cfc1] hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                  onClick={handlePaste}
                >
                  <Clipboard className="h-4 w-4 mr-1" />
                  Paste
                </Button>
              </CardContent>
            </Card>

            {/* Options Panel */}
            <Card className="mb-6 border-[#d9cfc1] shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#8b7755]">
                      Translation Type
                    </label>
                    <Select
                      value={translationType}
                      onValueChange={setTranslationType}
                    >
                      <SelectTrigger className="border-[#d9cfc1] focus:ring-[#8b7755]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TranslationType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#8b7755]">
                      Translation Engine
                    </label>
                    <Select
                      value={translationEngine}
                      onValueChange={setTranslationEngine}
                    >
                      <SelectTrigger className="border-[#d9cfc1] focus:ring-[#8b7755]">
                        <SelectValue placeholder="Select engine" />
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#8b7755] flex justify-between">
                      Font Size: <span>{fontSize}px</span>
                    </label>
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
              </CardContent>
            </Card>

            {/* Translate Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-6 lg:mb-0"
            >
              <Button
                className="w-full bg-[#a08e6c] hover:bg-[#8b7755] text-white"
                onClick={handleTranslate}
              >
                Dịch
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2"
          >
            <Card className="h-full border-[#d9cfc1] shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-[#8b7755]">
                  {translationType}
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="hover:bg-[#f0ebe2] hover:text-[#8b7755]"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-[#f0ebe2] min-h-[250px] whitespace-pre-line"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{
                    __html: outputText,
                  }}
                ></motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
