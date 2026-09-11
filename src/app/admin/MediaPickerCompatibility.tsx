"use client";

import { useEffect } from "react";

const MIXED_MEDIA_ACCEPT = "image/*,video/*";
const IMAGE_ACCEPT = "image/*";

function widenMediaPicker(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
    const accept = input.getAttribute("accept") ?? "";
    const allowsImages = accept.includes("image/");
    const allowsVideos = accept.includes("video/");

    if (allowsImages && allowsVideos) {
      input.setAttribute("accept", MIXED_MEDIA_ACCEPT);
    } else if (allowsImages) {
      input.setAttribute("accept", IMAGE_ACCEPT);
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
