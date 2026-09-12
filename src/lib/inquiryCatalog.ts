import "server-only";

import { readJson, writeJson } from "./r2Storage";

const CATALOG_KEY = "cms/inquiries/catalog.json";
const MAX_INQUIRIES = 500;

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  message: string;
  productName: string;
  productSlug: string;
  language: "de" | "en";
  createdAt: string;
  emailDelivered: boolean;
  handled: boolean;
};

export async function getInquiryCatalog(): Promise<InquiryRecord[]> {
  const data = await readJson<unknown>(CATALOG_KEY);
  if (!Array.isArray(data)) return [];
  return (data as InquiryRecord[])
    .filter((item) => item && typeof item.id === "string")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function saveInquiryCatalog(items: InquiryRecord[]) {
  const sorted = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_INQUIRIES);
  await writeJson(CATALOG_KEY, sorted);
  return sorted;
}

export async function addInquiry(inquiry: InquiryRecord) {
  const current = await getInquiryCatalog();
  await saveInquiryCatalog([inquiry, ...current.filter((item) => item.id !== inquiry.id)]);
  return inquiry;
}

export async function updateInquiry(
  id: string,
  patch: Partial<Pick<InquiryRecord, "emailDelivered" | "handled">>,
) {
  const current = await getInquiryCatalog();
  let updated: InquiryRecord | null = null;
  const next = current.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, ...patch };
    return updated;
  });
  if (!updated) return null;
  await saveInquiryCatalog(next);
  return updated;
}

export async function deleteInquiry(id: string) {
  const current = await getInquiryCatalog();
  const next = current.filter((item) => item.id !== id);
  if (next.length === current.length) return false;
  await saveInquiryCatalog(next);
  return true;
}
