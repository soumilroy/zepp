type LogoutConfirmDialogProps = {
    isOpen: boolean;
    isPending: boolean;
    isDisabled: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
};
export default function LogoutConfirmDialog({ isOpen, isPending, isDisabled, onOpenChange, onCancel, onConfirm, }: LogoutConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
