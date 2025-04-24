import { fetchProxy } from "@/lib/fetch-proxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // get host website url
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const hostUrl = `${protocol}://${host}`;
    console.log("hostUrl", hostUrl);

    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const html = await fetchProxy(url);

    // return the HTML content
    const headers = new Headers();
    headers.set("Content-Type", "text/html; charset=utf-8");
    return new Response(html, {
      headers,
      status: 200,
      statusText: "OK",
    });
  } catch (error) {
    console.error("Error fetching URL:", error);
    return NextResponse.error();
  }
}
