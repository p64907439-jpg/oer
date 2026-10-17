"use client";

import { CheckIcon, CloseIcon, CopyIcon, QrIcon, ShareIcon } from "@/components/icons";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Share sheet with QR code for a subject folder URL.
 * Uses the native <dialog> element — focus trapping, Esc dismissal,
 * and backdrop are handled by the browser (no manual focus code).
 */
export function ShareButton({
  url,
  title,
  className = "btn btn-outline text-xs",
  label = "Share",
}: {
  url: string;
  title: string;
  className?: string;
  label?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const absoluteUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : url;

  // Generate the QR when the dialog opens (direct call beats the
  // <dialog> "toggle" event, which has uneven browser support).
  useEffect(() => {
    if (!dialogRef.current?.open) return;

    QRCode.toDataURL(absoluteUrl, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0a", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR generation failed", err));
  }, [absoluteUrl, dialogOpen]);

  function open() {
    setCopied(false);
    setQrDataUrl(null);
    dialogRef.current?.showModal();
    setDialogOpen(true);
  }

  function close() {
    dialogRef.current?.close();
    setDialogOpen(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy manually");
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: `OER — ${title}`, url: absoluteUrl });
    } catch {
      /* user dismissed the share sheet — not an error */
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={open}>
        <ShareIcon width={14} height={14} />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        className="share-dialog"
        onClick={(e) => {
          // Backdrop click closes (event target is the dialog itself).
          if (e.target === dialogRef.current) close();
        }}
        onCancel={(e) => {
          // Intercept Esc to run the faster exit transition first.
          e.preventDefault();
          const el = dialogRef.current;
          if (el) {
            el.classList.add("closing");
            setTimeout(() => {
              el.classList.remove("closing");
              el.close();
              setDialogOpen(false);
            }, 150);
          }
        }}
        aria-label={`Share ${title}`}
      >
        <div className="card relative w-[min(24rem,calc(100vw-2rem))] overflow-hidden p-6 text-center">
          <button
            type="button"
            onClick={close}
            className="btn btn-ghost absolute right-2 top-2 h-8 w-8 !p-0 text-neutral-400"
            aria-label="Close share dialog"
          >
            <CloseIcon width={16} height={16} />
          </button>

          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
            <QrIcon />
          </span>
          <h2 className="mt-3 text-base font-semibold tracking-tight">
            Share “{title}”
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Students can scan the QR code or open the link — no account needed.
          </p>

          {/* QR */}
          <div className="mx-auto mt-4 flex aspect-square w-48 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${title}`}
                className="h-full w-full"
              />
            ) : (
              <div className="skeleton h-full w-full rounded-lg" />
            )}
          </div>

          {/* Link row */}
          <div className="mt-4 flex items-center gap-2">
            <div className="min-w-0 flex-1 truncate rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left font-mono text-xs text-neutral-600">
              {absoluteUrl}
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="btn btn-outline shrink-0 text-xs"
              aria-label="Copy link"
            >
              {copied ? (
                <CheckIcon width={14} height={14} className="text-green-600" />
              ) : (
                <CopyIcon width={14} height={14} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href={qrDataUrl ?? "#"}
              download={`oer-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qr.png`}
              className="btn btn-outline flex-1 text-xs"
              aria-disabled={!qrDataUrl}
            >
              Download QR
            </a>
            {typeof navigator !== "undefined" && !!navigator.share && (
              <button
                type="button"
                onClick={nativeShare}
                className="btn btn-primary flex-1 text-xs"
              >
                Share…
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
