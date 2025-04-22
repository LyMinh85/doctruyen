"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileArchive, Plus, Search } from "lucide-react";
import { dictionariesData } from "@/lib/utils";

export default function DictionariesManage() {
  console.log("dictionariesData", dictionariesData);
  const [dictionaries, setDictionaries] = useState(dictionariesData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDictionaries = dictionaries.filter(
    (dict) =>
      dict.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dict.filePath.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompressFile = async (key: string) => {
    
    // In a real app, this would call an API to compress the file
    const res = await fetch(`/api/dictionaries/${key.replace(".txt", "")}`);
    if (!res.ok) {
      alert("Error compressing file");
      return;
    }
    const data = await res.json();
    alert(data.message)
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center p-4 md:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-medium text-[#8b7755] mb-6 md:mb-8"
      >
        Dictionaries Manage
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-6xl"
      >
        <Card className="shadow-sm border-[#d9cfc1]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8b7755]/60" />
                <Input
                  placeholder="Search dictionaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#d9cfc1] focus-visible:ring-[#8b7755] w-full sm:w-[300px]"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-[#a08e6c] hover:bg-[#8b7755] text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Dictionary</span>
                </Button>
              </motion.div>
            </div>

            <div className="rounded-xl border border-[#d9cfc1] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f0ebe2]">
                    <TableHead className="text-[#8b7755] font-medium">
                      Dictionary Name
                    </TableHead>
                    <TableHead className="text-[#8b7755] font-medium">
                      File Path
                    </TableHead>
                    <TableHead className="text-[#8b7755] font-medium text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDictionaries.length > 0 ? (
                    filteredDictionaries.map((dictionary) => (
                      <TableRow
                        key={dictionary.id}
                        className="hover:bg-[#f0ebe2]/50"
                      >
                        <TableCell className="font-medium">
                          {dictionary.name}
                        </TableCell>
                        <TableCell className="text-[#8b7755]/70">
                          {dictionary.filePath}
                        </TableCell>
                        <TableCell className="text-right">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCompressFile(dictionary.id)
                              }
                              className="border-[#d9cfc1] hover:bg-[#f0ebe2] hover:text-[#8b7755] hover:border-[#8b7755] flex items-center gap-2"
                            >
                              <FileArchive className="h-4 w-4" />
                              <span>Compress File</span>
                            </Button>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-[#8b7755]/70"
                      >
                        No dictionaries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
