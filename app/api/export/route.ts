import { NextRequest } from "next/server";
import { Readable } from "stream";
import archiver from "archiver";

async function getProjectImagesAndLabels(projectId: string) {
  return [
    {
      imageName: "cat1.jpg",
      imageBuffer: await fetch("https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=512").then(r => r.arrayBuffer()).then(b => Buffer.from(b)),
      width: 512,
      height: 341,
      labels: [
        // YOLO: class_id x_center y_center width height (normalized 0-1)
        { x: 100, y: 100, w: 200, h: 120, label: "cat" },
        // เพิ่มได้หลาย box
      ]
    },
    // เพิ่มรูปอีกได้
  ];
}

const CLASSES = ["cat", "dog"]; 

function boxesToYoloTxt(boxes: any[], width: number, height: number): string {
  // {x, y, w, h, label}
  return boxes
    .map(box => {
      const classId = CLASSES.indexOf(box.label);
      const cx = (box.x + box.w / 2) / width;
      const cy = (box.y + box.h / 2) / height;
      const w = box.w / width;
      const h = box.h / height;
      return `${classId} ${cx} ${cy} ${w} ${h}`;
    })
    .join("\n");
}

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();

  // โหลดข้อมูล
  const imagesAndLabels = await getProjectImagesAndLabels(projectId);

  // สร้าง readable stream สำหรับ zip
  const archive = archiver("zip", { zlib: { level: 9 } });

  // pipe ลง stream ที่ Next.js รับได้
  const stream = new Readable().wrap(archive as any);

  // สำหรับ Next.js 14-15 (Edge ไม่รองรับ stream ตรง ต้องใช้ Response)
  const headers = new Headers();
  headers.append("Content-Type", "application/zip");
  headers.append("Content-Disposition", `attachment; filename="yolo_dataset_${projectId}.zip"`);

  // ใส่ไฟล์ classes.txt (YOLOv5/v8)
  archive.append(CLASSES.join("\n"), { name: "classes.txt" });

  for (const item of imagesAndLabels) {
    // 1. ใส่รูป
    archive.append(item.imageBuffer, { name: `images/${item.imageName}` });

    // 2. ใส่ label .txt
    const yoloTxt = boxesToYoloTxt(item.labels, item.width, item.height);
    const baseName = item.imageName.replace(/\.[^.]+$/, "");
    archive.append(yoloTxt, { name: `labels/${baseName}.txt` });
  }

  archive.finalize();

  return new Response(stream as any, { headers });
}
