"use client";

import {
  DownloadIcon,
  FolderIcon,
  GridIcon,
  UserIcon,
} from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Tab({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 px-1 pt-1.5 pb-1 text-[11px] font-medium ${
        active ? "text-neutral-900" : "text-neutral-500"
      }`}
    >
      <span
        className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors duration-150 ${
          active ? "bg-neutral-900 text-white" : ""
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

/**
 * Phone-only bottom tab bar — the app-like navigation surface on phones.
 * Desktop keeps the top header nav; this is hidden at ≥sm.
 *
 * Teachers get Browse / Downloads / Admin; everyone else gets
 * Browse / Downloads / Sign in.
 */
export function BottomNav({ isTeacher }: { isTeacher: boolean }) {
  const pathname = usePathname();

  const onBrowse =
    pathname === "/" ||
    pathname.startsWith("/subjects") ||
    pathname.startsWith("/teachers");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/70 bg-neutral-50/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <Tab
          href="/"
          label="Browse"
          icon={<FolderIcon width={17} height={17} />}
          active={onBrowse}
        />
        <Tab
          href="/downloads"
          label="Downloads"
          icon={<DownloadIcon width={17} height={17} />}
          active={pathname.startsWith("/downloads")}
        />
        {isTeacher ? (
          <Tab
            href="/admin"
            label="Admin"
            icon={<GridIcon width={17} height={17} />}
            active={pathname.startsWith("/admin")}
          />
        ) : (
          <Tab
            href="/login"
            label="Sign in"
            icon={<UserIcon width={17} height={17} />}
            active={pathname.startsWith("/login")}
          />
        )}
      </div>
    </nav>
  );
}
