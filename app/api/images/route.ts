import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const image = await prisma.image.findUnique({ where: { id: Number(id) } });
    return NextResponse.json({ image });
  }
  // หากไม่มี id ให้ส่งทั้งหมด
  const images = await prisma.image.findMany({
    orderBy: { uploaded: "desc" }
  });
  return NextResponse.json({ images });
}
