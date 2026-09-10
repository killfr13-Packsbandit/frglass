export type GalleryMediaItem = {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  contentType: string;
  description: string;
  descriptionEn: string;
  createdAt: string;
};

const DEFAULT_GALLERY_URLS = [
  "/jewelry/Cobald5 x Opaldust Leaf.jpg",
  "/jewelry/leaf2.jpg",
  "/jewelry/AmberPurple Leaf STube (2).JPG",
  "/jewelry/leaf4.jpg",
  "/jewelry/leaf5.jpg",
  "/jewelry/implo.jpg",
  "/jewelry/Barkylett.JPG",
  "/jewelry/Customer.JPG",
  "/jewelry/IMG_2173 4.JPG",
  "/jewelry/Mini Heart.JPG",
];

export const DEFAULT_GALLERY_MEDIA: GalleryMediaItem[] = DEFAULT_GALLERY_URLS.map(
  (mediaUrl, index) => ({
    id: `gallery-${index + 1}`,
    mediaUrl,
    mediaType: "image" as const,
    contentType: "image/jpeg",
    description: "",
    descriptionEn: "",
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
  }),
);
