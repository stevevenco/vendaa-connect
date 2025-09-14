import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CreateApiKeyResponse } from "@/types";
import { Copy } from "lucide-react";

interface ApiTokenDisplayDialogProps {
  apiKey: CreateApiKeyResponse;
  onClose: () => void;
}

export function ApiTokenDisplayDialog({
  apiKey,
  onClose,
}: ApiTokenDisplayDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    toast({
      title: "Copied!",
      description: "The API key has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Here is your new API key. Please save it securely, as you will not
            be able to see it again.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mt-2">
              <Input readOnly value={apiKey.key} />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
