"use client";
import React, { useRef } from "react";

export default function ImageUploader({ onUploaded }: { onUploaded?: () => void }) {
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/upload", { method: "POST", body: formData });
    if (onUploaded) onUploaded();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={handleUpload}
      />
      <button
        className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow"
        onClick={() => ref.current?.click()}
      >
        อัพโหลดรูปภาพ
      </button>
    </div>
  );
}
