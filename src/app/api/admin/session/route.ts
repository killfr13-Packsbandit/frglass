import { NextResponse } from "next/server";
import { isAdmin, isAdminConfigured } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    authenticated: await isAdmin(),
    authConfigured: isAdminConfigured(),
    storageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  });
}
