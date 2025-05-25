"use client";
import ImageUploader from "./components/ImageUploader";
import ImageList from "./components/ImageList";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // <<--- ใช้อันนี้

export default function Page() {
  const [refresh, setRefresh] = useState(false);
  const [editImage, setEditImage] = useState<null | {
    id: number,
    filename: string,
    path: string,
    uploaded: string
  }>(null);

  const router = useRouter(); // <<--- ประกาศ router

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">YOLO Image Manager</h1>
      <div className="mb-8 flex flex-col items-center">
        <ImageUploader onUploaded={() => setRefresh(r => !r)} />
      </div>
      <ImageList
        refresh={refresh}
        onEdit={img => setEditImage(img)}
      />

      {/* Edit Image Modal */}
      {editImage && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={() => setEditImage(null)}
              aria-label="ปิด"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-3">แก้ไขภาพ</h2>
            <img
              src={editImage.path}
              alt={editImage.filename}
              className="mb-4 w-full h-auto rounded shadow"
            />
            <div className="mb-2 text-sm">ชื่อไฟล์: {editImage.filename}</div>
            <div className="mb-4 text-sm text-gray-500">ID: {editImage.id}</div>
            {/* ปุ่มเปิดหน้า label */}
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  router.push(`/label/${editImage.id}`);
                  setEditImage(null);
                }}
              >
                ไปหน้าติด Label
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setEditImage(null)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
