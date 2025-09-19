import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UtilityCost } from "@/types";

interface UtilityCostsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  utilityCosts: UtilityCost[];
}

export const UtilityCostsDialog = ({
  open,
  onOpenChange,
  utilityCosts,
}: UtilityCostsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Utility Costs</DialogTitle>
          <DialogDescription>
            The costs associated with generating different types of tokens.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {utilityCosts.map((cost) => (
              <TableRow key={cost.uuid}>
                <TableCell>{cost.name}</TableCell>
                <TableCell>{cost.cost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};
