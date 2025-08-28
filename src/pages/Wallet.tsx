import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, ArrowUpDown, CreditCard, History, Copy } from "lucide-react";
import { dummyTransactions } from "@/data/dummyData";
import { useOrganizations } from "@/hooks/useOrganizations";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentOption, BankTransferPaymentOption, OnlineCheckoutPaymentOption } from "@/types";
import { initiateWalletFunding } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function WalletPage() {
  const { selectedOrganization, walletBalance, isLoading } = useOrganizations();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "online_checkout" | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentTransactions = dummyTransactions.slice(0, 10);

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

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
      setPaymentOptions(options);
      setIsModalOpen(true);
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
    toast({ title: "Copied!", description: "Account number copied to clipboard." });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your organization's wallet and transaction history.
          </p>
        </div>
      </div>

      <div className="w-full">
        <Card className="w-full min-w-[160px] snap-start md:min-w-0 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-lg sm:text-2xl font-bold">
                {walletBalance ?? "₦0.00"}
              </div>
            )}
            <p className="text-xs text-primary-foreground/80 mt-1">
              Available for vending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topup" className="text-sm sm:text-base">Top Up Wallet</TabsTrigger>
          <TabsTrigger value="history" className="text-sm sm:text-base">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Funds to Wallet
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Choose your preferred payment method to add funds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount" className="text-xs sm:text-sm">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    min="1000"
                    step="100"
                    className="text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum top-up amount is ₦1,000
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label className="text-xs sm:text-sm">Payment Method</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-medium">Bank Transfer</div>
                        <div className="text-xs text-muted-foreground">
                          Direct bank transfer - Instant
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={paymentMethod === 'online_checkout' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('online_checkout')}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-medium">Online Checkout</div>
                        <div className="text-xs text-muted-foreground">
                          Pay with debit card - Small fee
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToPayment}
                  disabled={isFetching || !amount || !paymentMethod}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm"
                >
                  {isFetching ? "Loading..." : "Proceed to Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <History className="h-4 w-4" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View all your wallet transactions and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{truncateText(transaction.description)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} at{" "}
                          {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={transaction.type === 'wallet_topup' ? 'default' : 'secondary'}
                        className="mb-1 text-xs sm:text-sm"
                      >
                        {transaction.type === 'wallet_topup' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Balance: ₦{transaction.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              {paymentMethod === 'bank_transfer'
                ? 'Use the details below to complete your payment.'
                : 'Click on a provider to proceed with your payment.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {paymentOptions.map((option) => (
              <div key={option.slug}>
                {'payment_url' in option ? (
                  <a href={(option as OnlineCheckoutPaymentOption).payment_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <img src={option.logo} alt={option.payment_gateway} className="h-10" />
                      </CardHeader>
                    </Card>
                  </a>
                ) : (
                  <Card>
                    <CardHeader>
                      <img src={option.logo} alt={option.payment_gateway} className="h-10" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Bank:</strong> {(option as BankTransferPaymentOption).bank_name}</p>
                      <p><strong>Account Name:</strong> {(option as BankTransferPaymentOption).account_name}</p>
                      <div className="flex items-center">
                        <p><strong>Account Number:</strong> {(option as BankTransferPaymentOption).account_number}</p>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard((option as BankTransferPaymentOption).account_number)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p><strong>Amount:</strong> ₦{option.amount}</p>
                      <p><strong>Fee:</strong> ₦{option.fee}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}