# FRGLASS

Website und kleines CMS für FRGLASS auf **Next.js + Cloudflare Workers + R2**.

## Lokal starten

```bash
npm install
npm run dev
```

Danach läuft die Seite unter `http://localhost:3000`.

## Cloudflare

Die Produktion läuft über Cloudflare Workers mit OpenNext. Medien und CMS-Daten liegen im R2-Bucket `frglass-media` über das Binding `FRGLASS_MEDIA`.

Nützliche Befehle:

```bash
npm run cf:build
npm run cf:deploy
npm run cf:upload
```

Die öffentliche Hauptdomain ist `https://frglass.at`. `www.frglass.at` wird auf die Hauptdomain weitergeleitet.

`vercel.json` bleibt nur als Schutzdatei im Repository, solange das alte Vercel-Projekt noch mit GitHub verbunden ist. Darin sind Git-Deployments deaktiviert; die Produktion läuft ausschließlich über Cloudflare.

## Admin

Der Adminbereich liegt unter `/admin`. Das Admin-Passwort wird als Cloudflare-Secret `BEHIND_SCENES_ADMIN_PASSWORD` gesetzt.

Anfragen aus dem Kontakt- und Produktformular werden direkt über Resend an `frglasswork@gmx.at` geschickt. Absender ist `FRGLASS Website <anfrage@frglass.at>` und die Kundenadresse wird als Reply-To gesetzt, damit eine normale Antwort direkt an den Kunden geht. Der geheime Resend-Schlüssel wird in Cloudflare als `RESEND_API_KEY` gesetzt. Es gibt bewusst keinen zweiten Anfrage-Posteingang im Adminbereich.

Neue Website-Medien werden als Bilder in R2 gespeichert. Bilder werden im Browser vor dem Upload verkleinert und nach Möglichkeit als WebP gespeichert, damit Speicher und Datenverkehr klein bleiben.

## Speicher-Hinweis

Galerie-, Studio- und Produktmedien werden beim Entfernen aus ihren Katalogen ebenfalls aus R2 gelöscht. Bei Website-Inhalten werden ersetzte, nicht mehr verwendete R2-Bilder ebenfalls automatisch entfernt.
