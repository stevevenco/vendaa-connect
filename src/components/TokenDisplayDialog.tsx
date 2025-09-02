import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Copy } from "lucide-react";

interface TokenDisplayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tokens: { description: string; token: string }[];
}

export default function TokenDisplayDialog({
  isOpen,
  onClose,
  title,
  tokens,
}: TokenDisplayDialogProps) {
  const { toast } = useToast();

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Copied to clipboard!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please enter the following token(s) into your meter.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {tokens.map((t, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t.description}</span>
                <span className="font-mono text-lg">{t.token}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(t.token)}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
