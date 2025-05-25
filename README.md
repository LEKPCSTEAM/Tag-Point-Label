# Tag-Point-Label

A modern web application for image dataset management and annotation, optimized for Computer Vision tasks (e.g., YOLO).

Upload images, draw bounding boxes, assign classes, and export annotations with ease.

---

## Features

- Upload new images via the web interface
- Display all uploaded images in a gallery
- Select any image to open a dedicated labeling page
- Draw bounding boxes and assign class labels
- Save label data (x, y, w, h) directly to the database (Prisma + SQLite)
- Delete unwanted labels
- (Optional) Export dataset and annotations in YOLO format

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database (Prisma + SQLite)

```bash
npx prisma migrate dev --name init

```

### 3. Run the development server

```bash
npm run dev

```

The app will run at http://localhost:3000

---

## Usage

1. Open the home page (/)
2. Upload new images
3. Click "Edit" (or Label) to open the label page for each image
4. Draw bounding boxes, assign classes, and save
5. Delete labels if needed
6. (Optional) Export YOLO labels using the utility at `/lib/yolo-export.ts`

---

## Tech Stack

- **Next.js 15+** (App Router, React)
- **Prisma ORM** + SQLite
- **TailwindCSS** (UI Framework)
- **TypeScript**

---

## Notes

- Uploaded images are saved to the `public/uploads/` folder
- Label data is stored as normalized coordinates (0-1) with class names
- You can adjust the class list via the code as needed# Tag-Point-Label
# Tag-Point-Label
