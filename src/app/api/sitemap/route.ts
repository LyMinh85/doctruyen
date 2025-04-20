import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const routes = ["/", "/dich-trung-viet"]; // Các đường dẫn chính trên website

export async function GET(request: NextRequest) {
  const host = request.headers.get(`host`) || `doctruyen.space`;
  const baseUrl = `https://${host}`; // Địa chỉ website

  // Tạo cấu trúc XML cho sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  routes.forEach((route) => {
    const fullUrl = `${baseUrl}/${route === "/" ? "" : route}`;
    sitemap += `
        <url>
          <loc>${fullUrl}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
      `;
  });

  sitemap += `</urlset>`;

  // Trả về response với header `Content-Type: application/xml`
  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
