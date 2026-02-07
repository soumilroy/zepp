import { LogOut, ShieldAlert } from "lucide-react";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type LogoutConfirmDialogProps = {
  isOpen: boolean;
  isPending: boolean;
  isDisabled: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LogoutConfirmDialog({
  isOpen,
  isPending,
  isDisabled,
  onOpenChange,
  onCancel,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            Log out?
          </DialogTitle>
          <DialogDescription className="border-t border-slate-200 pt-4 leading-relaxed dark:border-slate-800">
            This will delete any saved sessions and data.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={onConfirm}
            disabled={isDisabled || isPending}
          >
            <LogOut className="h-4 w-4" />
            {isPending ? "Logging out..." : "Confirm logout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
