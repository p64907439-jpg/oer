"use client";

import {
  DownloadIcon,
  HomeIcon,
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
      className={`flex flex-1 flex-col items-center gap-0.5 px-1 pt-2 pb-1.5 text-[10px] font-medium tracking-wide transition-colors duration-150 ${
        active ? "text-neutral-900" : "text-neutral-400"
      }`}
    >
      <span
        className={`flex h-7 w-11 items-center justify-center rounded-xl transition-all duration-150 ${
          active ? "bg-neutral-100 text-neutral-900" : ""
        }`}
        style={
          active
            ? {
                transform: "scale(1)",
              }
            : {}
        }
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/70 bg-white/95 backdrop-blur-xl backdrop-saturate-150 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch px-2">
        <Tab
          href="/"
          label="Browse"
          icon={<HomeIcon width={18} height={18} />}
          active={onBrowse}
        />
        <Tab
          href="/downloads"
          label="Downloads"
          icon={<DownloadIcon width={18} height={18} />}
          active={pathname.startsWith("/downloads")}
        />
        {isTeacher ? (
          <Tab
            href="/admin"
            label="Admin"
            icon={<GridIcon width={18} height={18} />}
            active={pathname.startsWith("/admin")}
          />
        ) : (
          <Tab
            href="/admin"
            label="Sign in"
            icon={<UserIcon width={18} height={18} />}
            active={pathname.startsWith("/admin")}
          />
        )}
      </div>
    </nav>
  );
}
