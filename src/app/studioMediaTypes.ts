export type MediaFit = "cover" | "contain";
export type MediaPosition = "center" | "top" | "bottom" | "left" | "right";

export type StudioMediaItem = {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  contentType: string;
  description: string;
  descriptionEn: string;
  createdAt: string;
  fit?: MediaFit;
  position?: MediaPosition;
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
    fit: "cover",
    position: "center",
  },
  {
    id: "studio-me2",
    mediaUrl: "/workshop/me2.jpg",
    mediaType: "image",
    contentType: "image/jpeg",
    description: "",
    descriptionEn: "",
    createdAt: "2026-01-01T00:00:01.000Z",
    fit: "cover",
    position: "center",
  },
];
