import { Lock } from "lucide-react";
import { useFullAccess } from "../purchases/FullAccessContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function getPaywallPriceLine(localizedPrice: string | null): string {
  return localizedPrice
    ? `${localizedPrice} · один платёж · доступ навсегда`
    : "Загружаем цену...";
}

export function FullAccessPaywall() {
  const {
    paywallOpen,
    closePaywall,
    localizedPrice,
    billingAvailable,
    status,
    message,
    purchaseFullAccess,
    restorePurchases,
  } = useFullAccess();

  const busy = status === "purchasing" || status === "restoring";
  const browserOnly = !billingAvailable && status === "unavailable";
  const priceLoading =
    !browserOnly &&
    !localizedPrice &&
    (status === "loading" || status === "ready");
  const unavailableMessage =
    message ?? "Google Play Billing не удалось загрузить.";
  const primaryLabel = localizedPrice
    ? `Открыть полный доступ — ${localizedPrice}`
    : "Открыть полный доступ";

  return (
    <Dialog open={paywallOpen} onOpenChange={open => !open && closePaywall()}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-primary/30 bg-card p-7 sm:max-w-sm">
        <DialogHeader className="items-center space-y-3 text-center sm:text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </div>
          <DialogTitle className="text-2xl">Полный доступ к VerbFlow</DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed">
            Практикуй все времена и формы глаголов английского языка — без ограничений.
          </DialogDescription>
          <p className="text-center text-sm font-semibold leading-relaxed text-foreground/80">
            Без подписки и автопродления — один платёж навсегда.
          </p>
        </DialogHeader>

        {browserOnly ? (
          <div className="space-y-3 text-center">
            <p className="rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm leading-relaxed text-muted-foreground">
              Покупка доступна только в Android-приложении через Google Play.
            </p>
            <Button
              className="w-full text-foreground underline underline-offset-4 hover:text-primary"
              variant="link"
              size="compact"
              onClick={closePaywall}
            >
              Понятно
            </Button>
          </div>
        ) : (
          <>
            {localizedPrice && (
              <p className="text-center font-semibold text-foreground">
                {getPaywallPriceLine(localizedPrice)}
              </p>
            )}

            {priceLoading && (
              <p className="text-center font-semibold text-muted-foreground">
                Загружаем цену...
              </p>
            )}

            {status === "pending" && (
              <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-center text-sm text-amber-200">
                Платёж обрабатывается Google Play. Доступ откроется после подтверждения.
              </p>
            )}
            {message && status !== "pending" && !priceLoading && (
              <p className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-center text-sm text-muted-foreground">
                {message}
              </p>
            )}
            {!billingAvailable && status !== "loading" && !message && (
              <p className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-center text-sm text-muted-foreground">
                {unavailableMessage}
              </p>
            )}

            <div className="space-y-2">
              <Button
                className="w-full"
                variant="primary"
                size="lg"
                disabled={!billingAvailable || !localizedPrice || busy || status === "pending"}
                onClick={() => void purchaseFullAccess()}
              >
                {busy && status === "purchasing" ? "Открываем Google Play…" : primaryLabel}
              </Button>
              <Button
                className="w-full"
                variant="tertiary"
                size="default"
                disabled={!billingAvailable || busy}
                onClick={() => void restorePurchases()}
              >
                {status === "restoring" ? "Восстанавливаем…" : "Восстановить покупку"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}