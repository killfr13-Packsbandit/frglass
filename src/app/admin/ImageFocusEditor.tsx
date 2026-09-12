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
  fit?: "cover" | "contain";
};

export default function ImageFocusEditor({
  src,
  zoom,
  focusX,
  focusY,
  onChange,
  aspectClass = "aspect-[4/3]",
  mediaType = "image",
  fit,
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

  const effectiveFit = zoom < 1 ? "contain" : (fit ?? "cover");
  const mediaStyle = {
    objectFit: effectiveFit,
    objectPosition: `${focusX}% ${focusY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  } as const;

  return (
    <div className="frglass-focus-editor w-full min-w-0 max-w-full overflow-hidden">
      <style>{`
        @media (max-width: 767px) {
          .grid:has(.frglass-focus-editor) {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .grid:has(.frglass-focus-editor) > * {
            grid-column: 1 / -1 !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      <div
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        className={`relative w-full min-w-0 max-w-full ${aspectClass} touch-none cursor-crosshair overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 select-none`}
      >
        {mediaType === "video" ? (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="pointer-events-none block h-full w-full"
            style={mediaStyle}
          />
        ) : (
          <img
            src={src}
            alt="Bildvorschau"
            draggable={false}
            className="pointer-events-none block h-full w-full"
            style={mediaStyle}
          />
        )}
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30 shadow-[0_0_0_1px_rgba(0,0,0,.8)] sm:h-6 sm:w-6"
          style={{ left: `${focusX}%`, top: `${focusY}%` }}
        >
          <span className="absolute left-1/2 top-[-6px] h-8 w-px -translate-x-1/2 bg-white/90 sm:top-[-7px] sm:h-[36px]" />
          <span className="absolute left-[-6px] top-1/2 h-px w-8 -translate-y-1/2 bg-white/90 sm:left-[-7px] sm:w-[36px]" />
        </div>
        <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-full bg-black/70 px-3 py-1.5 text-center text-[10px] font-bold text-white backdrop-blur sm:inset-x-3 sm:bottom-3 sm:text-[11px]">
          <span className="sm:hidden">Ziehen = Ausschnitt</span>
          <span className="hidden sm:inline">Antippen oder ziehen = Ausschnitt verschieben</span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3 sm:mt-4 sm:p-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <b className="text-sm">Zoom</b>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.01"
            value={zoom}
            onChange={(event) => onChange({ zoom: Number(event.target.value) })}
            className="min-w-0 w-full accent-orange-300"
          />
          <span className="whitespace-nowrap text-sm text-neutral-500">{zoom.toFixed(2)}×</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
          <span className="whitespace-nowrap">X {Math.round(focusX)}% · Y {Math.round(focusY)}%</span>
          <button type="button" onClick={() => onChange({ zoom: 1, focusX: 50, focusY: 50 })} className="whitespace-nowrap font-bold text-orange-300">Zentrieren</button>
        </div>
      </div>
    </div>
  );
}
