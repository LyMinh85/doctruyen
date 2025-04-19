"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Clipboard, Expand, Minimize } from "lucide-react";
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

export default function TranslationApp() {
  const [inputText, setInputText] = useState<string>(``);
  const [translationType, setTranslationType] = useState<string>(
    TranslationType.Vietnamese
  );
  const [translationEngine, setTranslationEngine] = useState<string>(
    TranslationEngine.RuleBaseMT
  );
  const [fontSize, setFontSize] = useState<number>(16);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [outputText, setOutputText] = useState<string>("");
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
          loadDictionaryByNameInClient(DictFilePath.names),
          loadDictionaryByNameInClient(DictFilePath.vietphraseQuickTranslator),
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
    setOutputText(removeBrTags(translatedText.text));
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-medium text-[#8b7755] mb-6 md:mb-10">
        Dịch tiếng trung
      </h1>

      <div className="w-full max-w-3xl">
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
              className="min-h-[150px] resize-y border-[#d9cfc1] focus-visible:ring-[#8b7755]"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onValueChange={(value: number[]) => setFontSize(value[0])}
                  className="py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translate Button */}
        <Button
          className="w-full mb-6 bg-[#a08e6c] hover:bg-[#8b7755] text-white"
          onClick={handleTranslate}
        >
          Dịch
        </Button>

        {/* Output Section */}
        <motion.div
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`${expanded ? "w-full max-w-5xl mx-auto" : "w-full"}`}
        >
          <Card className="border-[#d9cfc1] shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-[#8b7755]">
                {translationType}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="hover:bg-[#f0ebe2] hover:text-[#8b7755]"
              >
                {expanded ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Expand className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div
                className="p-4 rounded-xl bg-[#f0ebe2] min-h-[150px] whitespace-pre-line"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: outputText }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
