# FRGLASS

Website und kleines CMS für FRGLASS auf **Next.js + Cloudflare Workers + R2**.

## Lokal starten

```bash
npm install
npm run dev
```

Danach läuft die Seite unter `http://localhost:3000`.

## Cloudflare

Die Produktion läuft über Cloudflare Workers mit OpenNext. Medien, CMS-Daten und Website-Anfragen liegen im R2-Bucket `frglass-media` über das Binding `FRGLASS_MEDIA`.

Nützliche Befehle:

```bash
npm run cf:build
npm run cf:deploy
npm run cf:upload
```

Die öffentliche Hauptdomain ist `https://frglass.at`. `www.frglass.at` wird auf die Hauptdomain weitergeleitet.

## Admin

Der Adminbereich liegt unter `/admin`. Das Admin-Passwort wird als Cloudflare-Secret `BEHIND_SCENES_ADMIN_PASSWORD` gesetzt.

Anfragen aus dem Kontakt- und Produktformular werden zuerst in R2 gespeichert und sind unter `/admin/inquiries` sichtbar. Wenn `RESEND_API_KEY` gesetzt ist, wird zusätzlich eine E-Mail-Benachrichtigung verschickt. Optional können `INQUIRY_EMAIL_TO` und `INQUIRY_EMAIL_FROM` gesetzt werden.

Neue Website-Medien werden als Bilder in R2 gespeichert. Bilder werden im Browser vor dem Upload verkleinert und nach Möglichkeit als WebP gespeichert, damit Speicher und Datenverkehr klein bleiben.

## Speicher-Hinweis

Galerie-, Studio- und Produktmedien werden beim Entfernen aus ihren Katalogen ebenfalls aus R2 gelöscht. Bei Website-Inhalten werden ersetzte, nicht mehr verwendete R2-Bilder ebenfalls automatisch entfernt.
