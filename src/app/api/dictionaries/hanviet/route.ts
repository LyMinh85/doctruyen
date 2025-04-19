import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";
const readFile = promisify(fs.readFile);

export async function GET() {
  try {
    const dictionaryPath = path.join(
      process.cwd(),
      "src",
      "data",
      "dictionaries",
      "hanviet.txt"
    );
    const fileContent = await readFile(dictionaryPath, "utf8");
    return new NextResponse(fileContent);
  } catch (error: unknown) {
    console.error("Error reading dictionary file:", error);
    return NextResponse.json(
      { error: "Failed to read dictionary file" },
      { status: 500 }
    );
  }
}
