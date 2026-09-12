import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/adminAuth";
import {
  addInquiry,
  deleteInquiry,
  getInquiryCatalog,
  updateInquiry,
  type InquiryRecord,
} from "../../../lib/inquiryCatalog";
import { siteConfig } from "../../siteConfig";

export const dynamic = "force-dynamic";

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    return NextResponse.json({
      inquiries: await getInquiryCatalog(),
      emailConfigured: resendConfigured(),
    });
  } catch (error) {
    console.error("Could not load inquiries", error);
    return NextResponse.json({ error: "Could not load inquiries." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        name?: unknown;
        email?: unknown;
        message?: unknown;
        productName?: unknown;
        productSlug?: unknown;
        company?: unknown;
        language?: unknown;
      }
    | null;

  const name = cleanText(body?.name, 80);
  const email = cleanText(body?.email, 160).toLowerCase();
  const message = cleanText(body?.message, 2000);
  const productName = cleanText(body?.productName, 160);
  const productSlug = cleanText(body?.productSlug, 180);
  const company = cleanText(body?.company, 160);
  const language: "de" | "en" = cleanText(body?.language, 5) === "de" ? "de" : "en";

  // Honeypot: bots get a harmless success response without writing anything.
  if (company) return NextResponse.json({ ok: true, delivered: false });

  if (!name || !validEmail(email) || !message) {
    return NextResponse.json(
      {
        error:
          language === "de"
            ? "Bitte Name, gültige E-Mail-Adresse und Nachricht ausfüllen."
            : "Please enter your name, a valid email address and a message.",
      },
      { status: 400 },
    );
  }

  const inquiry: InquiryRecord = {
    id: randomUUID(),
    name,
    email,
    message,
    productName,
    productSlug,
    language,
    createdAt: new Date().toISOString(),
    emailDelivered: false,
    handled: false,
  };

  // First save the lead in R2. That way no inquiry is lost if the mail provider
  // is missing or temporarily unavailable.
  try {
    await addInquiry(inquiry);
  } catch (error) {
    console.error("Could not store inquiry", error);
    return NextResponse.json(
      {
        error:
          language === "de"
            ? "Die Anfrage konnte gerade nicht gespeichert werden."
            : "The inquiry could not be saved right now.",
      },
      { status: 503 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: true, delivered: false, id: inquiry.id });
  }

  const to = process.env.INQUIRY_EMAIL_TO?.trim() || siteConfig.email;
  const from =
    process.env.INQUIRY_EMAIL_FROM?.trim() ||
    "FRGLASS Website <onboarding@resend.dev>";
  const productLine = productName
    ? `Produkt / Piece: ${productName}`
    : "Allgemeine Anfrage / General inquiry";
  const productUrl = productSlug
    ? `https://frglass.at/shop/${encodeURIComponent(productSlug)}`
    : "";
  const subject = productName
    ? `FRGLASS Anfrage – ${productName}`
    : "FRGLASS Website-Anfrage";
  const text = [
    "Neue Anfrage über frglass.at",
    "",
    productLine,
    productUrl,
    "",
    `Name: ${name}`,
    `E-Mail: ${email}`,
    "",
    "Nachricht:",
    message,
    "",
    `Gesendet: ${inquiry.createdAt}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const providerMessage = await response.text().catch(() => "");
      console.error("Inquiry email provider returned", response.status, providerMessage.slice(0, 300));
      return NextResponse.json({ ok: true, delivered: false, id: inquiry.id });
    }

    try {
      await updateInquiry(inquiry.id, { emailDelivered: true });
    } catch (error) {
      console.error("Inquiry was emailed but delivery flag could not be saved", error);
    }

    return NextResponse.json({ ok: true, delivered: true, id: inquiry.id });
  } catch (error) {
    console.error(
      "Could not send inquiry email",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json({ ok: true, delivered: false, id: inquiry.id });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; handled?: unknown }
    | null;
  const id = cleanText(body?.id, 80);
  if (!id || typeof body?.handled !== "boolean") {
    return NextResponse.json({ error: "Invalid inquiry." }, { status: 400 });
  }

  try {
    const inquiry = await updateInquiry(id, { handled: body.handled });
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }
    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Could not update inquiry", error);
    return NextResponse.json({ error: "Could not update inquiry." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = cleanText(body?.id, 80);
  if (!id) return NextResponse.json({ error: "Invalid inquiry." }, { status: 400 });

  try {
    const removed = await deleteInquiry(id);
    if (!removed) {
      return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete inquiry", error);
    return NextResponse.json({ error: "Could not delete inquiry." }, { status: 500 });
  }
}
