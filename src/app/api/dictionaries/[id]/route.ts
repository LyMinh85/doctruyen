import { NextRequest, NextResponse } from "next/server";
import { createGzip } from "zlib";
import { join } from "path";
import { createReadStream } from "fs";
import { DictionaryFilePath } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const dictPath = DictionaryFilePath[id as keyof typeof DictionaryFilePath];
    if (!dictPath) {
      return new NextResponse("File not found", { status: 404 });
    }
    
    // Path to the existing .txt file
    const filePath = join(process.cwd(), "src", dictPath);
    const readStream = createReadStream(filePath);
    const gzip = createGzip();

    // Collect compressed data
    const compressedChunks: Buffer[] = [];
    const compressedStream = readStream.pipe(gzip);
    for await (const chunk of compressedStream) {
      compressedChunks.push(chunk);
    }
    const compressedBuffer = Buffer.concat(compressedChunks);

    // Set response headers
    const headers = new Headers();
    headers.set("Content-Type", "application/gzip");
    headers.set("Content-Disposition", `attachment; filename="${id}.txt.gz"`);
    headers.set("Content-Length", compressedBuffer.length.toString());

    return new NextResponse(compressedBuffer, { headers });
  } catch (error) {
    console.error("Error compressing file:", error);
    return new NextResponse("Error generating file", { status: 500 });
  }
}
