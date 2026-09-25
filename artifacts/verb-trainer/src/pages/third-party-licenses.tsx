import { ArrowLeft, Download } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import noticesText from "../assets/licenses/THIRD_PARTY_LICENSES.txt?raw";
import noticesFileUrl from "../assets/licenses/THIRD_PARTY_LICENSES.txt?url";

export default function ThirdPartyLicenses() {
  const [, navigate] = useLocation();

  return (
    <main className="min-h-[100dvh] bg-background pt-safe text-foreground">
      <div className="mx-auto w-full max-w-md px-6 pb-safe">
        <header className="sticky top-0 z-10 -mx-6 flex items-center gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to Settings"
            onClick={() => navigate("/settings")}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Third-Party Licenses</h1>
            <p className="text-xs text-muted-foreground">
              Available offline
            </p>
          </div>
        </header>

        <section className="py-6">
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            VerbFlow includes open-source software and the Inter font. The
            copyright notices and complete applicable license texts are
            reproduced below.
          </p>

          <a
            href={noticesFileUrl}
            download="VerbFlow-Third-Party-Licenses.txt"
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download size={16} aria-hidden="true" />
            Download notice file
          </a>

          <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 font-mono text-[11px] leading-5 text-card-foreground">
            {noticesText}
          </pre>
        </section>
      </div>
    </main>
  );
}