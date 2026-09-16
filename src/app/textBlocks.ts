export type FlexibleTextPage = "home" | "about" | "studio" | "shop" | "gallery" | "contact";

export type FlexibleTextBlock = {
  id: string;
  placement: string;
  enabled: boolean;
  eyebrowDe: string;
  eyebrowEn: string;
  titleDe: string;
  titleEn: string;
  textDe: string;
  textEn: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  mediaZoom: number;
  mediaFocusX: number;
  mediaFocusY: number;
};

export const FLEXIBLE_TEXT_BLOCK_KEY_PREFIX = "flexTextBlocks.";

export function flexibleTextBlockKey(page: FlexibleTextPage) {
  return `${FLEXIBLE_TEXT_BLOCK_KEY_PREFIX}${page}`;
}

function text(value: unknown, max = 5000) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function number(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export function parseFlexibleTextBlocks(raw: string): FlexibleTextBlock[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 30).flatMap((value, index) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return [];
      const item = value as Record<string, unknown>;
      const id = text(item.id, 120) || `block-${index + 1}`;
      return [{
        id,
        placement: text(item.placement, 80) || "bottom",
        enabled: item.enabled !== false,
        eyebrowDe: text(item.eyebrowDe, 300),
        eyebrowEn: text(item.eyebrowEn, 300),
        titleDe: text(item.titleDe, 500),
        titleEn: text(item.titleEn, 500),
        textDe: text(item.textDe, 5000),
        textEn: text(item.textEn, 5000),
        mediaUrl: text(item.mediaUrl, 3000),
        mediaType: item.mediaType === "video" ? "video" : "image",
        mediaZoom: number(item.mediaZoom, 1, 0.5, 2.5),
        mediaFocusX: number(item.mediaFocusX, 50, 0, 100),
        mediaFocusY: number(item.mediaFocusY, 50, 0, 100),
      }];
    });
  } catch {
    return [];
  }
}

export function serializeFlexibleTextBlocks(blocks: FlexibleTextBlock[]) {
  return JSON.stringify(blocks.slice(0, 30));
}
