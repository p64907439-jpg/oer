"use client";

import {
  DownloadIcon,
  FolderIcon,
  GoogleIcon,
  GridIcon,
  MailIcon,
} from "@/components/icons";
import { usePendingInviteCount } from "@/lib/invites";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Tab({
  href,
  label,
  icon,
  active,
  badge = 0,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  badge?: number;
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
        className={`relative flex h-7 w-11 items-center justify-center rounded-full transition-colors duration-150 ${
          active ? "bg-neutral-900 text-white" : ""
        }`}
      >
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      {label}
    </Link>
  );
}

/**
 * Phone-only bottom tab bar — the app-like navigation surface on phones.
 * Desktop keeps the top header nav; this is hidden at ≥sm.
 */
export function BottomNav({ userId }: { userId: string | null }) {
  const pathname = usePathname();
  const invites = usePendingInviteCount(userId);

  const onBrowse =
    pathname === "/" ||
    pathname.startsWith("/subjects") ||
    pathname.startsWith("/classrooms") ||
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
        {userId ? (
          <>
            <Tab
              href="/inbox"
              label="Inbox"
              icon={<MailIcon width={17} height={17} />}
              active={pathname.startsWith("/inbox")}
              badge={invites}
            />
            <Tab
              href="/dashboard"
              label="Dashboard"
              icon={<GridIcon width={17} height={17} />}
              active={pathname.startsWith("/dashboard")}
            />
          </>
        ) : (
          <Tab
            href="/login"
            label="Sign in"
            icon={<GoogleIcon width={17} height={17} />}
            active={pathname.startsWith("/login")}
          />
        )}
      </div>
    </nav>
  );
}
