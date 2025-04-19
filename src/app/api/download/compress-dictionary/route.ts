import { NextResponse } from "next/server";
import { createGzip } from "zlib";
import { pipeline } from "stream";
import { promisify } from "util";
import { join } from "path";
import { createReadStream } from "fs";
import { DictFilePath } from "@/lib/utils";

// Promisify pipeline for async/await
const pipelineAsync = promisify(pipeline);

export async function GET() {
  try {
    // Path to the existing .txt file
    const filePath = join(
      process.cwd(),
      "/public",
      DictFilePath.names
    );
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
    headers.set("Content-Disposition", 'attachment; filename="data.txt.gz"');
    headers.set("Content-Length", compressedBuffer.length.toString());

    return new NextResponse(compressedBuffer, { headers });
  } catch (error) {
    console.error("Error compressing file:", error);
    return new NextResponse("Error generating file", { status: 500 });
  }
}
