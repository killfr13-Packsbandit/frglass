"use client";

import { useEffect } from "react";

const IMAGE_ACCEPT = "image/*";

function normalizeMediaPicker(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
    const accept = input.getAttribute("accept") ?? "";
    if (accept.includes("image/")) {
      input.setAttribute("accept", IMAGE_ACCEPT);
    }
  });
}

export default function MediaPickerCompatibility() {
  useEffect(() => {
    normalizeMediaPicker();

    const observer = new MutationObserver(() => normalizeMediaPicker());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
