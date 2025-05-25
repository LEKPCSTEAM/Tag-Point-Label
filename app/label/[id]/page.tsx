"use client";
import React, { useEffect, useRef, useState } from "react";

const CLASSES = ["cat", "dog"]; // Custom class

type Label = {
  id: number;
  className: string;
  x: number; // normalized (0-1)
  y: number;
  w: number;
  h: number;
};

export default function LabelPage({ params }: { params: never }) {
  // ใช้ React.use(params) สำหรับ Next.js 15.3+
  const { id } = React.use(params);
  const imageId = Number(id);

  const [image, setImage] = useState<{ path: string, filename: string } | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [currentClass, setCurrentClass] = useState(CLASSES[0]);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number, y: number } | null>(null);
  const [previewBox, setPreviewBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  const [imgSize, setImgSize] = useState<{ w: number, h: number }>({ w: 1, h: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // โหลดรูปและ labels
  useEffect(() => {
    fetch(`/api/images?id=${imageId}`)
      .then(res => res.json())
      .then(data => setImage(data.image));
    fetch(`/api/labels?imageId=${imageId}`)
      .then(res => res.json())
      .then(data => setLabels(data.labels));
  }, [imageId]);

  // โหลดและเซ็ตขนาดภาพ/ขนาด canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const img = new window.Image();
    img.src = image.path;
    img.onload = () => {
      setImgSize({ w: img.width, h: img.height });
      // Set ขนาด canvas ตรงกับขนาดภาพ
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      drawAll(img, labels, previewBox);
    };
  // eslint-disable-next-line
  }, [image]);

  // ฟังก์ชันวาดภาพ + labels + preview box
  const drawAll = (
    imgEl: HTMLImageElement,
    drawLabels: Label[],
    preview?: { x: number; y: number; w: number; h: number } | null
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, imgEl.width, imgEl.height);
    ctx.drawImage(imgEl, 0, 0);

    // วาด labels ที่ save แล้ว
    for (const box of drawLabels) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        box.x * imgEl.width,
        box.y * imgEl.height,
        box.w * imgEl.width,
        box.h * imgEl.height
      );
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.fillRect(
        box.x * imgEl.width,
        box.y * imgEl.height - 18,
        ctx.measureText(box.className).width + 8,
        18
      );
      ctx.fillStyle = "white";
      ctx.fillText(
        box.className,
        box.x * imgEl.width + 4,
        box.y * imgEl.height - 4
      );
    }

    // วาด preview box ระหว่างลาก
    if (preview) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(preview.x, preview.y, preview.w, preview.h);
      ctx.setLineDash([]);
    }
  };

  // เมื่อ labels หรือ preview box เปลี่ยน ให้ redraw
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const img = new window.Image();
    img.src = image.path;
    img.onload = () => {
      drawAll(img, labels, previewBox);
    };
  }, [labels, previewBox, image]);

  // --- Event Mapping ที่ถูกต้องทุกกรณี! ---
  // mouse บน canvas อาจจะถูก scale (เช่น responsive), ต้องแปลงค่ากลับไปเป็น pixel บน canvas จริงก่อน
  function getCanvasCoords(
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  }

  // --- Mouse Event สำหรับลากกล่อง ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!imgSize.w || !imgSize.h) return;
    const { x, y } = getCanvasCoords(e);
    setStart({ x, y });
    setDrawing(true);
    setPreviewBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!drawing || !start) return;
    const { x, y } = getCanvasCoords(e);
    const bx = Math.min(start.x, x);
    const by = Math.min(start.y, y);
    const bw = Math.abs(x - start.x);
    const bh = Math.abs(y - start.y);
    setPreviewBox({ x: bx, y: by, w: bw, h: bh });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!drawing || !start) return;
    setDrawing(false);
    const { x: x2, y: y2 } = getCanvasCoords(e);
    const bx = Math.min(start.x, x2);
    const by = Math.min(start.y, y2);
    const bw = Math.abs(x2 - start.x);
    const bh = Math.abs(y2 - start.y);
    setStart(null);
    setPreviewBox(null);

    if (bw < 5 || bh < 5) return; // ignore tiny box

    // save label (normalized)
    fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageId,
        className: currentClass,
        x: bx / imgSize.w,
        y: by / imgSize.h,
        w: bw / imgSize.w,
        h: bh / imgSize.h,
      })
    }).then(r => r.json()).then(lab => {
      setLabels(ls => [...ls, lab.label]);
    });
  };

  if (!image) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl mb-3 font-bold">Label ภาพ: {image.filename}</h2>
      <div className="flex items-center gap-4 mb-4">
        <span>Class:</span>
        <select
          className="border rounded px-2 py-1"
          value={currentClass}
          onChange={e => setCurrentClass(e.target.value)}
        >
          {CLASSES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500">ลากเพื่อวาดกล่อง</span>
      </div>
      <div className="relative" style={{ width: imgSize.w, height: imgSize.h, maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={imgSize.w}
          height={imgSize.h}
          style={{
            border: "2px solid #333",
            width: "100%",
            maxWidth: "100%",
            display: "block",
            background: "#222",
            cursor: "crosshair"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Labels</h3>
        <ul className="space-y-1">
          {labels.map(l => (
            <li key={l.id} className="flex gap-2 items-center">
              <span className="px-2 py-1 bg-blue-100 rounded">{l.className}</span>
              <span className="text-xs text-gray-400">
                ({l.x.toFixed(2)}, {l.y.toFixed(2)}, {l.w.toFixed(2)}, {l.h.toFixed(2)})
              </span>
              <button
                className="ml-2 px-2 rounded text-red-600 hover:bg-red-100"
                onClick={async () => {
                  await fetch(`/api/labels?id=${l.id}`, { method: "DELETE" });
                  setLabels(ls => ls.filter(x => x.id !== l.id));
                }}
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
