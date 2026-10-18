import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DownloadsClient } from "./downloads-client";

export const instant = false;

export const metadata = {
  title: "Downloads",
};

export default function DownloadsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <DownloadsClient />
      </main>
      <SiteFooter />
    </>
  );
}
