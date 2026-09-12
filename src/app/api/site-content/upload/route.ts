import { handleR2ImageUpload } from "../../../../lib/r2UploadServer";

export async function POST(request: Request) {
  return handleR2ImageUpload(request, "site/media/");
}
