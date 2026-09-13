export type UploadOptions = {
  access?: "public";
  handleUploadUrl: string;
  multipart?: boolean;
  onUploadProgress?: (event: { percentage: number }) => void;
  [key: string]: unknown;
};

type UploadResult = { url: string };

const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export async function upload(
  _pathname: string,
  file: File,
  options: UploadOptions,
): Promise<UploadResult> {
  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, GIF, MP4, MOV and WebM files are allowed on the website.");
  }

  options.onUploadProgress?.({ percentage: 1 });

  const form = new FormData();
  form.append("file", file, file.name);

  const response = await fetch(options.handleUploadUrl, {
    method: "POST",
    body: form,
  });
  const data = (await response.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error || "Upload failed.");
  }

  options.onUploadProgress?.({ percentage: 100 });
  return { url: data.url };
}
