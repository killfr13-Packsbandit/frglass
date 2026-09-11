"use client";

import { PointerEvent } from "react";

type Props = {
  src: string;
  zoom: number;
  focusX: number;
  focusY: number;
  onChange: (next: { zoom?: number; focusX?: number; focusY?: number }) => void;
  aspectClass?: string;
  mediaType?: "image" | "video";
};

export default function ImageFocusEditor({
  src,
  zoom,
  focusX,
  focusY,
  onChange,
  aspectClass = "aspect-[4/3]",
  mediaType = "image",
}: Props) {
  function place(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    onChange({ focusX: Math.round(x * 10) / 10, focusY: Math.round(y * 10) / 10 });
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    place(event);
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) place(event);
  }

  const minZoom = mediaType === "image" ? 0.5 : 1;
  const mediaStyle = {
    objectPosition: `${focusX}% ${focusY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  } as const;

  return (
    <div>
      <div
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        className={`relative ${aspectClass} touch-none cursor-crosshair overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 select-none`}
      >
        {mediaType === "video" ? (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="pointer-events-none h-full w-full object-cover"
            style={mediaStyle}
          />
        ) : (
          <img
            src={src}
            alt="Bildvorschau"
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
            style={mediaStyle}
          />
        )}
        <div
          className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30 shadow-[0_0_0_1px_rgba(0,0,0,.8)]"
          style={{ left: `${focusX}%`, top: `${focusY}%` }}
        >
          <span className="absolute left-1/2 top-[-7px] h-[36px] w-px -translate-x-1/2 bg-white/90" />
          <span className="absolute left-[-7px] top-1/2 h-px w-[36px] -translate-y-1/2 bg-white/90" />
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-black/65 px-3 py-1.5 text-center text-[11px] font-bold text-white backdrop-blur">
          Antippen oder ziehen = Ausschnitt verschieben
        </div>
      </div>

      <label className="mt-4 block">
        <span className="flex justify-between text-sm"><b>Zoom</b><span className="text-neutral-500">{zoom.toFixed(2)}×</span></span>
        <input type="range" min={minZoom} max="2.5" step="0.01" value={zoom} onChange={(event) => onChange({ zoom: Number(event.target.value) })} className="mt-2 w-full accent-orange-300" />
      </label>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
        <span>X {Math.round(focusX)}% · Y {Math.round(focusY)}%</span>
        <button type="button" onClick={() => onChange({ zoom: 1, focusX: 50, focusY: 50 })} className="font-bold text-orange-300">Zentrieren</button>
      </div>
    </div>
  );
}
