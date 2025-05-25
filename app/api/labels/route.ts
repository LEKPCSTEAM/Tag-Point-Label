import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: /api/labels?imageId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageId = Number(searchParams.get("imageId"));
  if (!imageId) return NextResponse.json({ error: "imageId is required" }, { status: 400 });

  const labels = await prisma.label.findMany({
    where: { imageId },
    orderBy: { id: "asc" }
  });
  return NextResponse.json({ labels });
}

// POST: { imageId, className, x, y, w, h }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageId, className, x, y, w, h } = body;
  if (!imageId || !className || x === undefined || y === undefined || w === undefined || h === undefined) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const label = await prisma.label.create({
    data: { imageId, className, x, y, w, h }
  });
  return NextResponse.json({ label });
}

// DELETE: /api/labels?id=10
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.label.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
