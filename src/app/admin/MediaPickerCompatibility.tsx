"use client";

import { useEffect } from "react";

const IMAGE_ACCEPT = "image/*";
const redispatchedInputs = new WeakSet<HTMLInputElement>();

function looksLikeHeic(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "image/heic" || type === "image/heif" || /\.(heic|heif)$/.test(name);
}

function normalizedStandardImage(file: File) {
  const type = file.type.toLowerCase();
  if (type === "image/jpg") {
    return new File([file], file.name || "image.jpg", {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  }
  return file;
}

async function convertHeic(file: File) {
  const { default: heic2any } = await import("heic2any");
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.88,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error("HEIC conversion failed");
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

async function makeFilesBrowserFriendly(files: File[]) {
  const converted: File[] = [];
  for (const file of files) {
    if (looksLikeHeic(file)) {
      converted.push(await convertHeic(file));
    } else {
      converted.push(normalizedStandardImage(file));
    }
  }
  return converted;
}

function normalizeMediaPicker(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
    const accept = input.getAttribute("accept") ?? "";
    if (accept.includes("image/")) input.setAttribute("accept", IMAGE_ACCEPT);
  });
}

export default function MediaPickerCompatibility() {
  useEffect(() => {
    normalizeMediaPicker();

    const observer = new MutationObserver(() => normalizeMediaPicker());
    observer.observe(document.body, { childList: true, subtree: true });

    const handleChange = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;

      if (redispatchedInputs.has(input)) {
        redispatchedInputs.delete(input);
        return;
      }

      const files = Array.from(input.files ?? []);
      if (!files.length || !files.some(looksLikeHeic)) return;

      // Stop the page-specific handler until Samsung/Android HEIC photos are converted.
      event.preventDefault();
      event.stopImmediatePropagation();

      void (async () => {
        try {
          const prepared = await makeFilesBrowserFriendly(files);
          const transfer = new DataTransfer();
          prepared.forEach((file) => transfer.items.add(file));
          input.files = transfer.files;
        } catch (error) {
          console.error("Could not convert HEIC/HEIF image", error);
          // Keep the original selection; the page can then show its normal upload error.
        }

        redispatchedInputs.add(input);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      })();
    };

    document.addEventListener("change", handleChange, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("change", handleChange, true);
    };
  }, []);

  return null;
}
