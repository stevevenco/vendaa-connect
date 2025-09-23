import { useState } from "react";
import { useTopUp } from "@/hooks/useTopUp";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Copy, CheckCircle } from "lucide-react";
import {
  PaymentOption,
  BankTransferPaymentOption,
  OnlineCheckoutPaymentOption,
} from "@/types";
import { initiateWalletFunding } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export const TopUpModal = () => {
  const { isModalOpen, closeModal } = useTopUp();
  const { selectedOrganization, fetchWalletBalance } = useOrganizations();
  const { user } = useAuth();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "online_checkout" | null
  >(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleProceedToPayment = async () => {
    if (!amount || !paymentMethod || !selectedOrganization) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount and select a payment method.",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    try {
      const options = await initiateWalletFunding(
        selectedOrganization.uuid,
        paymentMethod,
        parseFloat(amount)
      );

      if (selectedOrganization.is_sandbox || user?.display_state === "test") {
        setIsSuccessModalOpen(true);
      } else {
        setPaymentOptions(options);
        setShowPaymentOptions(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard.",
    });
  };

  const handleClose = () => {
    closeModal();
    // Reset state on close
    setTimeout(() => {
      setAmount("");
      setPaymentMethod(null);
      setPaymentOptions([]);
      setShowPaymentOptions(false);
    }, 300); // Delay to allow modal to close gracefully
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    handleClose(); // Close the main modal as well
    if (selectedOrganization) {
      fetchWalletBalance(selectedOrganization.uuid);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showPaymentOptions
                ? "Complete Your Payment"
                : "Add Funds to Wallet"}
            </DialogTitle>
            <DialogDescription>
              {showPaymentOptions
                ? paymentMethod === "bank_transfer"
                  ? "Use the details below to complete your payment."
                  : "Click on a provider to proceed."
                : "Choose your preferred payment method to add funds."}
            </DialogDescription>
          </DialogHeader>

          {showPaymentOptions ? (
            <div className="space-y-4">
              {paymentOptions.map((option) => (
                <div key={option.slug}>
                  {"payment_url" in option ? (
                    <a
                      href={(option as OnlineCheckoutPaymentOption).payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={handleClose}
                    >
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader>
                          <img
                            src={option.logo}
                            alt={option.payment_gateway}
                            className="h-10 w-auto object-contain"
                          />
                        </CardHeader>
                      </Card>
                    </a>
                  ) : (
                    <Card>
                      <CardHeader>
                        <img
                          src={option.logo}
                          alt={option.payment_gateway}
                          className="h-10 w-auto object-contain"
                        />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p>
                          <strong>Bank:</strong>{" "}
                          {(option as BankTransferPaymentOption).bank_name}
                        </p>
                        <p>
                          <strong>Account Name:</strong>{" "}
                          {(option as BankTransferPaymentOption).account_name}
                        </p>
                        <div className="flex items-center">
                          <p>
                            <strong>Account Number:</strong>{" "}
                            {(option as BankTransferPaymentOption)
                              .account_number}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                (option as BankTransferPaymentOption)
                                  .account_number
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p>
                          <strong>Amount:</strong> ₦{option.amount}
                        </p>
                        <p>
                          <strong>Fee:</strong> ₦{option.fee}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Your wallet will be credited instantly once the
                          transfer is complete.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (NGN)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  min="1000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum top-up amount is ₦1,000
                </.p>
              </div>

              <div className="grid gap-3">
                <Label>Payment Method</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant={
                      paymentMethod === "bank_transfer" ? "default" : "outline"
                    }
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className="justify-start h-auto p-3 text-left"
                  >
                    <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-muted-foreground">
                        Direct bank transfer - Instant
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant={
                      paymentMethod === "online_checkout"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setPaymentMethod("online_checkout")}
                    className="justify-start h-auto p-3 text-left"
                  >
                    <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Online Checkout</div>
                      <div className="text-xs text-muted-foreground">
                        Pay with debit card - Small fee
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {!showPaymentOptions && (
              <Button
                onClick={handleProceedToPayment}
                disabled={isFetching || !amount || !paymentMethod}
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
              >
                {isFetching ? "Thinking..." : "Proceed to Payment"}
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              {showPaymentOptions ? "Close" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <DialogTitle>Payment Successful</DialogTitle>
              <DialogDescription>
                Your wallet has been credited and your new balance is available.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessModalClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
