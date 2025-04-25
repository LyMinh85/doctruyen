import { TranslationEngine } from "@/types";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface TranslateWebsiteTabProps {
  tabContentVariants: any;
  handleWebsiteTranslate: (url: string) => void;
}

export default function TranslateWebsiteTab({
  tabContentVariants,
  handleWebsiteTranslate,
}: TranslateWebsiteTabProps & {
  key: string;
}) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [translationEngine, setTranslationEngine] = useState<string>(
    TranslationEngine.Vietphrase
  );

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