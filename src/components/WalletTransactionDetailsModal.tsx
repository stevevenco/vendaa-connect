import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { getWalletTransaction } from '@/services/api';
import { Transaction } from '@/types';
import { useOrganization } from '@/context/useOrganization';

interface WalletTransactionDetailsModalProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WalletTransactionDetailsModal = ({ transactionId, isOpen, onClose }: WalletTransactionDetailsModalProps) => {
  const { selectedOrganization } = useOrganization();
  const [transactionDetails, setTransactionDetails] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && transactionId && selectedOrganization) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getWalletTransaction(selectedOrganization.uuid, transactionId);
          setTransactionDetails(data);
        } catch (err) {
          setError('Failed to fetch transaction details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, transactionId, selectedOrganization]);

  const renderDetailRow = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value}</dd>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Detailed information for transaction: {transactionDetails?.transaction_id || '...'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && !isLoading && (
            <div className="flex flex-col justify-center items-center h-40 text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          )}
          {transactionDetails && !isLoading && !error && (
            <dl>
              {renderDetailRow('Transaction ID', transactionDetails.transaction_id)}
              {renderDetailRow('Title', transactionDetails.title)}
              {renderDetailRow('Amount', `₦${parseFloat(transactionDetails.amount).toLocaleString()}`)}
              {renderDetailRow('Status', <Badge variant={transactionDetails.status === 'success' ? 'success' : ''}>{transactionDetails.status}</Badge>)}
              {renderDetailRow('Event', transactionDetails.event)}
              {renderDetailRow('Date/Time', new Date(transactionDetails.created_at).toLocaleString())}
            </dl>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};