export type StudioMediaItem = {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  contentType: string;
  description: string;
  descriptionEn: string;
  createdAt: string;
};

export const DEFAULT_STUDIO_MEDIA: StudioMediaItem[] = [
  {
    id: "studio-me1",
    mediaUrl: "/workshop/me1.png",
    mediaType: "image",
    contentType: "image/png",
    description: "",
    descriptionEn: "",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "studio-me2",
    mediaUrl: "/workshop/me2.jpg",
    mediaType: "image",
    contentType: "image/jpeg",
    description: "",
    descriptionEn: "",
    createdAt: "2026-01-01T00:00:01.000Z",
  },
];
