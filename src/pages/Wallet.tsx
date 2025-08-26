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

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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

      {/* Wallet Overview */}
      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-mandatory space-x-4 md:space-x-0 pb-4">
        <Card className="min-w-[160px] snap-start md:min-w-0 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              ₦{dummyWallet.balance.toLocaleString()}
            </div>
            <p className="text-xs text-primary-foreground/80 mt-1">
              Available for vending
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">₦{dummyWallet.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">Total Top-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">₦{dummyWallet.totalTopUps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time deposits</p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{dummyWallet.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">Pending transactions</p>
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
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum top-up amount is ₦1,000
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label className="text-xs sm:text-sm">Payment Method</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" className="justify-start h-auto p-3 text-left">
                      <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-medium">Bank Transfer</div>
                        <div className="text-xs text-muted-foreground">
                          Direct bank transfer - Instant
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-3 text-left">
                      <CreditCard className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm font-medium">Debit Card</div>
                        <div className="text-xs text-muted-foreground">
                          Pay with debit card - Small fee
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-sm">
                  Proceed to Payment
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
    </div>
  );
}