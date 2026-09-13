import { mediaBucket } from "../../../../lib/r2Storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  let objectKey = key.join("/");
  try {
    objectKey = decodeURIComponent(objectKey);
  } catch {
    // Keep the already-decoded path when it contains a malformed escape sequence.
  }

  const object = await mediaBucket().get(objectKey);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  // Stream from R2 instead of buffering entire images/videos in the Worker.
  // Concurrent downloads otherwise share the Worker's limited memory budget.
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
