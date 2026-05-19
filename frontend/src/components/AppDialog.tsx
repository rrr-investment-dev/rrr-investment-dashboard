import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AppDialogProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

const AppDialog = ({ open, title, children, onClose }: AppDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[90vh] max-h-[90vh] overflow-y-auto scroll-smooth">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable area */}
        <div
          data-slot="dialog-content"
          className="overflow-y-auto h-full scroll-smooth pr-2"
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
