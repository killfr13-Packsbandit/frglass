import { NextResponse } from "next/server";
import { isAdmin, isAdminConfigured } from "../../../../lib/adminAuth";
import { checkR2Configured } from "../../../../lib/r2Storage";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    authenticated: await isAdmin(),
    authConfigured: isAdminConfigured(),
    storageConfigured: await checkR2Configured(),
  });
}
