"use client";
import React, { useEffect, useState } from "react";

type Image = { id: number; filename: string; path: string; uploaded: string };

export default function ImageList({
  refresh,
  onEdit
}: {
  refresh?: boolean,
  onEdit?: (img: Image) => void
}) {
  const [images, setImages] = useState<Image[]>([]);
  const fetchImages = async () => {
    const res = await fetch("/api/images");
    const data = await res.json();
    setImages(data.images);
  };
  useEffect(() => { fetchImages(); }, [refresh]);

  if (!images.length) {
    return <div className="text-center text-gray-500">ยังไม่มีรูปภาพ</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">รายการรูป</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {images.map(img => (
          <div key={img.id} className="rounded-xl shadow-md bg-white p-3 flex flex-col items-center">
            <img
              src={img.path}
              width={180}
              alt={img.filename}
              className="rounded shadow mb-2"
            />
            <div className="font-mono text-xs break-all">{img.filename}</div>
            <div className="text-xs text-gray-400 mb-2">ID: {img.id}</div>
            <button
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded shadow text-sm"
              onClick={() => onEdit && onEdit(img)}
            >
              แก้ไขภาพ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
