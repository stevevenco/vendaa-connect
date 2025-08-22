import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, ArrowUpDown, CreditCard, History } from "lucide-react";
import { dummyWallet, dummyTransactions } from "@/data/dummyData";

export default function WalletPage() {
  const recentTransactions = dummyTransactions.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your organization's wallet and transaction history.
          </p>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₦{dummyWallet.balance.toLocaleString()}
            </div>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Available for vending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{dummyWallet.totalSpent.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Top-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{dummyWallet.totalTopUps.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">All time deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyWallet.pendingTransactions}</div>
            <p className="text-sm text-muted-foreground">Pending transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topup">Top Up Wallet</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Funds to Wallet
              </CardTitle>
              <CardDescription>
                Choose your preferred payment method to add funds to your organization's wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    min="1000"
                    step="100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum top-up amount is ₦1,000
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label>Payment Method</Label>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <CreditCard className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-muted-foreground">
                          Direct bank transfer - Instant processing
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <CreditCard className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Debit Card</div>
                        <div className="text-sm text-muted-foreground">
                          Pay with your debit card - Small processing fee
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
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
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} at{" "}
                          {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={transaction.type === 'wallet_topup' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {transaction.type === 'wallet_topup' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
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
    </div>
  );
}