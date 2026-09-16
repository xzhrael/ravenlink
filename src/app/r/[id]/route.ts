import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const link = await prisma.link.findUnique({
    where: { id },
    include: {
      user: {
        select: { username: true },
      },
    },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check schedule validity
  const now = new Date();
  if (link.startDate && now < link.startDate) {
    // Scheduled for future
    const fallbackUrl = link.user.username ? `/${link.user.username}` : "/";
    return NextResponse.redirect(new URL(fallbackUrl, request.url));
  }
  if (link.endDate && now > link.endDate) {
    // Expired
    const fallbackUrl = link.user.username ? `/${link.user.username}` : "/";
    return NextResponse.redirect(new URL(fallbackUrl, request.url));
  }

  // Gather analytics safely
  const referrer = request.headers.get("referer") || null;
  const userAgent = request.headers.get("user-agent") || null;
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

  // Increment clicks & record analytics asynchronously
  try {
    await prisma.$transaction([
      prisma.link.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } },
      }),
      prisma.clickAnalytics.create({
        data: {
          linkId: link.id,
          referrer: referrer ? referrer.slice(0, 500) : null,
          userAgent: userAgent ? userAgent.slice(0, 500) : null,
          ipHash,
        },
      }),
    ]);
  } catch (err) {
    console.error("Failed to record click analytics:", err);
  }

  // Redirect visitor to final destination URL
  return NextResponse.redirect(link.url, { status: 307 });
}
