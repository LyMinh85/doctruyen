import { NextRequest, NextResponse } from "next/server";
import { createGzip } from "zlib";
import { join } from "path";
import { createReadStream } from "fs";
import { promises as fsPromises } from "fs";
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
    const filePath = join(process.cwd(), "src/data/dictionaries", dictPath);
    const readStream = createReadStream(filePath);
    const gzip = createGzip();

    // Collect compressed data
    const compressedChunks: Buffer[] = [];
    const compressedStream = readStream.pipe(gzip);
    for await (const chunk of compressedStream) {
      compressedChunks.push(chunk);
    }
    const compressedBuffer = Buffer.concat(compressedChunks);

    // Save compressed file to public/dicts directory
    const saveDir = join(process.cwd(), "public", "dicts");

    // Create directory if it doesn't exist
    await fsPromises.mkdir(saveDir, { recursive: true });

    // Save the compressed file
    const savePath = join(saveDir, `${id}.txt.gz`);
    await fsPromises.writeFile(savePath, compressedBuffer);
    console.log(`File saved to: ${savePath}`);

    return NextResponse.json(
      {
        message: "File compressed successfully",
        filePath: savePath,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error compressing file:", error);
    return new NextResponse("Error generating file", { status: 500 });
  }
}
