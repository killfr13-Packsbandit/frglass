import { NextResponse } from "next/server";
import { siteConfig } from "../../siteConfig";

export const dynamic = "force-dynamic";

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function errorMessage(language: "de" | "en") {
  return language === "de"
    ? "Die Anfrage konnte gerade nicht gesendet werden. Bitte versuch es noch einmal oder nutze den E-Mail-Link."
    : "The inquiry could not be sent right now. Please try again or use the email link.";
}

export async function GET() {
  return NextResponse.json(
    { configured: Boolean(process.env.RESEND_API_KEY?.trim()) },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
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

  // Honeypot for simple form bots. Pretend success so bots do not learn the rule.
  if (company) return NextResponse.json({ ok: true });

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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("Inquiry email is missing RESEND_API_KEY");
    return NextResponse.json({ error: errorMessage(language) }, { status: 503 });
  }

  const to = process.env.INQUIRY_EMAIL_TO?.trim() || siteConfig.email;
  const from =
    process.env.INQUIRY_EMAIL_FROM?.trim() ||
    "FRGLASS Website <website@frglass.at>";
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
    `Gesendet: ${new Date().toISOString()}`,
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
      const providerResponse = await response.text().catch(() => "");
      console.error(
        "Inquiry email provider returned",
        response.status,
        providerResponse.slice(0, 500),
      );
      return NextResponse.json({ error: errorMessage(language) }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Could not send inquiry email",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json({ error: errorMessage(language) }, { status: 502 });
  }
}
