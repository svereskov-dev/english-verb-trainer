import { FormEvent, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "../hooks/use-toast";
import { useFullAccess } from "../purchases/FullAccessContext";
import { verifyReviewAccessCode } from "../purchases/reviewAccess";

interface ReviewAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewAccessDialog({
  open,
  onOpenChange,
}: ReviewAccessDialogProps) {
  const { enableReviewAccess } = useFullAccess();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const resetAndClose = () => {
    setCode("");
    setError(null);
    setChecking(false);
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChecking(true);
    setError(null);

    const valid = await verifyReviewAccessCode(code);
    if (!valid) {
      setChecking(false);
      setError("Incorrect review access code.");
      return;
    }

    enableReviewAccess();
    resetAndClose();
    toast({ title: "Review access enabled." });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) resetAndClose();
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-primary/30 bg-card p-7 sm:max-w-sm">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">Review Access</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Enter the review access code to unlock all Full Access features on this device.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={event => void handleSubmit(event)}>
          <div className="space-y-2">
            <Input
              type="password"
              value={code}
              onChange={event => {
                setCode(event.target.value);
                if (error) setError(null);
              }}
              aria-label="Review access code"
              aria-invalid={Boolean(error)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={checking}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="tertiary"
              onClick={resetAndClose}
              disabled={checking}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={checking || code.length === 0}>
              Unlock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}