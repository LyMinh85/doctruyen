import iconv from "iconv-lite";
import * as cheerio from "cheerio";
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
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; YourApp/1.0)", // Avoid bot detection
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Get response as buffer to handle encoding
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "";
    let charset = "utf-8"; // Default to UTF-8

    // Detect charset from Content-Type or meta tags
    const charsetMatch = contentType.match(/charset=([\w-]+)/i);
    if (charsetMatch) {
      charset = charsetMatch[1].toLowerCase();
    } else {
      // Check meta charset in HTML
      const htmlPreview = iconv.decode(Buffer.from(buffer), "utf-8");
      const metaMatch = htmlPreview.match(
        /<meta[^>]*charset=["']?([\w-]+)["']?/i
      );
      if (metaMatch) {
        charset = metaMatch[1].toLowerCase();
      }
    }

    let html = "";

    // Decode to UTF-8
    if (iconv.encodingExists(charset)) {
      html = iconv.decode(Buffer.from(buffer), charset);
    } else {
      html = iconv.decode(Buffer.from(buffer), "utf-8"); // Fallback to UTF-8
    }

    // Fallback for garbled content
    if (html.includes("�") || !html.trim()) {
      const possibleEncodings = ["gb2312", "gbk", "iso-8859-1"];
      for (const enc of possibleEncodings) {
        const testHtml = iconv.decode(Buffer.from(buffer), enc);
        if (!testHtml.includes("�") && testHtml.trim()) {
          html = testHtml;
          charset = enc;
          break;
        }
      }
    }

    // Rewrite relative URLs to absolute URLs
    const $ = cheerio.load(html);
    const baseUrlIframe = new URL(url).origin; // e.g., https://example.com
    $("link, script, img, source, video, audio").each((i: any, elem: any) => {
      const src =
        $(elem).attr("src") || $(elem).attr("href") || $(elem).attr("srcset");
      if (
        src &&
        !src.startsWith("http") &&
        !src.startsWith("data:") &&
        !src.startsWith("#")
      ) {
        const absoluteUrl = new URL(src, baseUrlIframe).href;
        if ($(elem).attr("src")) {
          $(elem).attr("src", absoluteUrl);
        } else if ($(elem).attr("href")) {
          $(elem).attr("href", absoluteUrl);
        } else if ($(elem).attr("srcset")) {
          $(elem).attr("srcset", absoluteUrl);
        }
      }
    });

    // Handle <a> tags separately using baseUrlHost
    $("a").each((i: any, elem: any) => {
      const href = $(elem).attr("href");
      if (
        href &&
        !href.startsWith("data:") &&
        !href.startsWith("#")
      ) {
        const absoluteUrl = `${
          new URL(href, baseUrlIframe).href
        }`;
        $(elem).attr("href", absoluteUrl);
      }

      // Remove target="_blank" attribute if it exists
      if ($(elem).attr("target") === "_blank") {
        $(elem).removeAttr("target");
      }
    });

    // Fix CSS URLs in <style> tags
    $("style").each((i: any, elem: any) => {
      let css = $(elem).html();
      if (css) {
        css = css.replace(
          /url\s*\(['"]?([^'")]+)['"]?\)/g,
          (match: any, p1: any) => {
            if (
              !p1.startsWith("http") &&
              !p1.startsWith("data:") &&
              !p1.startsWith("#")
            ) {
              return `url(${new URL(p1, baseUrlIframe).href})`;
            }
            return match;
          }
        );
        $(elem).html(css);
      }
    });

    // Fix CSS URLs in inline styles
    $("[style]").each((i: any, elem: any) => {
      let style = $(elem).attr("style");
      if (style) {
        style = style.replace(
          /url\s*\(['"]?([^'")]+)['"]?\)/g,
          (match: any, p1: any) => {
            if (
              !p1.startsWith("http") &&
              !p1.startsWith("data:") &&
              !p1.startsWith("#")
            ) {
              return `url(${new URL(p1, baseUrlIframe).href})`;
            }
            return match;
          }
        );
        $(elem).attr("style", style);
      }
    });

    html = $.html();
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
