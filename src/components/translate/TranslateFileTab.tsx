import { TranslationEngine } from "@/types";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useState } from "react";
import { TabsContent } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

interface TranslateFileTabProps {
  tabContentVariants: any;
}

export default function TranslateFileTab({
  tabContentVariants,
}: TranslateFileTabProps & {
  key: string;
}) {
  // File translation state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translationEngine, setTranslationEngine] = useState<string>(
    TranslationEngine.Vietphrase
  );

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
