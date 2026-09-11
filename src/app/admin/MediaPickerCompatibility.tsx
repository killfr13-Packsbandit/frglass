"use client";

import { useEffect } from "react";

const MEDIA_ACCEPT = "image/*,video/*";

function widenMediaPicker(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
    const accept = input.getAttribute("accept") ?? "";
    if (accept.includes("image/") || accept.includes("video/")) {
      input.setAttribute("accept", MEDIA_ACCEPT);
    }
  });
}

export default function MediaPickerCompatibility() {
  useEffect(() => {
    widenMediaPicker();

    const observer = new MutationObserver(() => widenMediaPicker());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
