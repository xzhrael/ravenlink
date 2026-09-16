import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  if (!username) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { username: { equals: username } },
    select: { image: true, name: true },
  });

  if (!user || !user.image) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // If external URL (e.g. Google avatar), redirect to it
  if (user.image.startsWith("http://") || user.image.startsWith("https://")) {
    return NextResponse.redirect(user.image, 307);
  }

  // If base64 data URL, parse and return binary image with long-lived browser caching
  if (user.image.startsWith("data:")) {
    const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}
