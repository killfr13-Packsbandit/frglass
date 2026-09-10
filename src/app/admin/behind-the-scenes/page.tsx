"use client";

import { upload } from "@vercel/blob/client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SessionState = {
  authenticated: boolean;
  authConfigured: boolean;
  storageConfigured: boolean;
};

type Post = {
  id: string;
  title: string;
  text: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  contentType: string;
  createdAt: string;
  recordUrl?: string;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2200;

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "upload";
}

async function loadImage(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Das Foto konnte nicht verarbeitet werden.");

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.88),
  );

  if (!blob) throw new Error("Das Foto konnte nicht optimiert werden.");

  const baseName = safeFileName(file.name.replace(/\.[^.]+$/, ""));
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BehindScenesAdminPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  const isVideo = file?.type.startsWith("video/") ?? false;

  const fileSize = useMemo(() => {
    if (!file) return "";
    return `${(file.size / 1024 / 1024).toFixed(1)} MB`;
  }, [file]);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: SessionState) => setSession(data))
      .catch(() =>
        setSession({
          authenticated: false,
          authConfigured: false,
          storageConfigured: false,
        }),
      );
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const loadPosts = async () => {
    const response = await fetch("/api/behind-the-scenes/posts", {
      cache: "no-store",
    });
    const data = (await response.json()) as { posts?: Post[] };
    setPosts(Array.isArray(data.posts) ? data.posts : []);
  };

  useEffect(() => {
    if (session?.authenticated) void loadPosts();
  }, [session?.authenticated]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Login fehlgeschlagen.");
      }

      const sessionResponse = await fetch("/api/admin/session", {
        cache: "no-store",
      });
      setSession((await sessionResponse.json()) as SessionState);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession((current) =>
      current ? { ...current, authenticated: false } : current,
    );
    setPosts([]);
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !session?.storageConfigured) return;

    if (file.size > MAX_FILE_BYTES) {
      setMessage("Die Datei ist größer als 50 MB.");
      return;
    }

    setBusy(true);
    setProgress(0);
    setMessage("");

    try {
      let uploadFile = file;

      if (file.type.startsWith("image/")) {
        setMessage("Foto wird fürs Web optimiert …");
        try {
          uploadFile = await optimizeImage(file);
        } catch {
          if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
            throw new Error(
              "Dieses Fotoformat konnte nicht umgewandelt werden. Bitte das Bild als JPG, PNG oder WebP auswählen.",
            );
          }
        }
      }

      const pathname = `behind-scenes/media/${Date.now()}-${safeFileName(uploadFile.name)}`;
      const blob = await upload(pathname, uploadFile, {
        access: "public",
        handleUploadUrl: "/api/behind-the-scenes/upload",
        multipart: uploadFile.size > 4 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage));
          setMessage("");
        },
      });

      const saveResponse = await fetch("/api/behind-the-scenes/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          text,
          mediaUrl: blob.url,
          contentType: uploadFile.type,
        }),
      });

      if (!saveResponse.ok) {
        const data = (await saveResponse.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Beitrag konnte nicht gespeichert werden.");
      }

      setFile(null);
      setTitle("");
      setText("");
      setProgress(0);
      setMessage("Veröffentlicht ✓");
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const deletePost = async (post: Post) => {
    if (!post.recordUrl) return;
    if (!window.confirm("Diesen Beitrag wirklich löschen?")) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/behind-the-scenes/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordUrl: post.recordUrl,
          mediaUrl: post.mediaUrl,
        }),
      });

      if (!response.ok) throw new Error("Löschen fehlgeschlagen.");
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setMessage("Beitrag gelöscht.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Löschen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Laden …</p>
      </main>
    );
  }

  if (!session.authConfigured) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-orange-300/25 bg-white/[0.04] p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS Admin</p>
          <h1 className="mt-4 text-3xl font-black uppercase sm:text-4xl">Fast bereit.</h1>
          <p className="mt-5 leading-7 text-neutral-300">
            Der private Uploadbereich ist eingebaut. Es fehlt nur noch dein geheimes Admin-Passwort als Vercel-Umgebungsvariable.
          </p>
          <code className="mt-5 block overflow-x-auto rounded-2xl border border-white/10 bg-black p-4 text-sm text-orange-200">
            BEHIND_SCENES_ADMIN_PASSWORD
          </code>
        </div>
      </main>
    );
  }

  if (!session.authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 py-24 text-white">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS Admin</p>
          <h1 className="mt-4 text-3xl font-black uppercase">Behind the Scenes</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Privater Bereich zum Veröffentlichen von Werkstatt-Updates.
          </p>

          <label className="mt-7 block text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
            Passwort
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-base font-normal normal-case tracking-normal text-white outline-none transition focus:border-orange-300"
              required
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-orange-200 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Prüfe …" : "Anmelden"}
          </button>

          {message && <p className="mt-4 text-sm text-orange-200">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS Admin</p>
            <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl">Werkstatt-Update</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:border-orange-300 hover:text-orange-300"
          >
            Logout
          </button>
        </div>

        {!session.storageConfigured && (
          <div className="mt-8 rounded-2xl border border-orange-300/30 bg-orange-300/[0.06] p-5 text-sm leading-6 text-orange-100">
            Vercel Blob ist noch nicht mit dem Projekt verbunden. Sobald der Speicher verbunden ist, wird der Upload hier automatisch freigeschaltet.
          </div>
        )}

        <form
          onSubmit={publish}
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8"
        >
          <label className="block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-white/20 bg-black transition hover:border-orange-300/60">
            {previewUrl ? (
              <div className="relative flex min-h-[340px] items-center justify-center bg-neutral-950">
                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="max-h-[560px] w-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="max-h-[560px] w-full object-contain"
                  />
                )}
                <span className="absolute bottom-4 right-4 rounded-full bg-black/75 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                  Ändern
                </span>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-orange-300/35 bg-orange-300/[0.08] text-3xl text-orange-300">+</span>
                <span className="mt-5 text-lg font-black uppercase">Foto oder Video auswählen</span>
                <span className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                  Direkt aus deiner Fotomediathek. Bilder werden beim Upload automatisch fürs Web optimiert.
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*,video/mp4,video/quicktime"
              className="sr-only"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setFile(selectedFile);
                setMessage("");
                setProgress(0);
              }}
            />
          </label>

          {file && (
            <p className="mt-3 text-xs text-neutral-500">
              {file.name} · {fileSize}
            </p>
          )}

          <label className="mt-6 block text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">
            Titel <span className="font-normal normal-case tracking-normal text-neutral-600">(optional)</span>
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="z. B. Neue Farbtests"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-base font-normal normal-case tracking-normal text-white outline-none transition placeholder:text-neutral-700 focus:border-orange-300"
            />
          </label>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">
            Text <span className="font-normal normal-case tracking-normal text-neutral-600">(optional)</span>
            <textarea
              maxLength={700}
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ein kurzer Einblick aus der Werkstatt …"
              className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-4 text-base font-normal leading-7 normal-case tracking-normal text-white outline-none transition placeholder:text-neutral-700 focus:border-orange-300"
            />
          </label>

          {busy && progress > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
                <span>Upload</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-orange-300 transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || busy || !session.storageConfigured}
            className="mt-6 w-full rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {busy ? "Wird veröffentlicht …" : "Veröffentlichen"}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-orange-200">{message}</p>
          )}
        </form>

        {posts.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-10">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300">Veröffentlicht</p>
            <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">Deine Updates</h2>

            <div className="mt-7 space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:items-center sm:p-4"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-950 sm:h-28 sm:w-24">
                    {post.mediaType === "video" ? (
                      <video
                        src={post.mediaUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt={post.title || "Workshop update"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                      {formatDate(post.createdAt)}
                    </p>
                    <h3 className="mt-1 truncate font-bold text-white">
                      {post.title || "Ohne Titel"}
                    </h3>
                    {post.text && (
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-400">
                        {post.text}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={busy || !post.recordUrl}
                    onClick={() => deletePost(post)}
                    className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 transition hover:border-red-400/50 hover:text-red-300 disabled:opacity-30"
                  >
                    Löschen
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
