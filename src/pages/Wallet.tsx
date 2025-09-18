import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, ArrowUpDown, History, RefreshCw } from "lucide-react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useTopUp } from "@/hooks/useTopUp";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WalletPage() {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const {
    walletBalance,
    isLoading,
    selectedOrganization,
    fetchWalletBalance,
    isBalanceLoading,
    transactions,
    isTransactionsLoading,
    fetchTransactions,
  } = useOrganizations();
  const { openModal } = useTopUp();

  const [totalSpent, setTotalSpent] = useState(0);
  const [totalTopUps, setTotalTopUps] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState(0);

  useEffect(() => {
    if (transactions) {
      const spent = transactions
        .filter(t => t.status === 'success' && !t.title.toLowerCase().includes('top-up'))
        .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g, '')), 0);
      setTotalSpent(spent);

      const topUps = transactions
        .filter(t => t.status === 'success' && t.title.toLowerCase().includes('top-up'))
        .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g, '')), 0);
      setTotalTopUps(topUps);

      const pending = transactions.filter(t => t.status === 'pending').length;
      setPendingTransactions(pending);
    }
  }, [transactions]);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedMonth === "all") return true;
    const txDate = new Date(tx.created_at);
    return txDate.getMonth() + 1 === parseInt(selectedMonth);
  });

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
        <Button
          onClick={openModal}
          className="bg-gradient-to-r from-primary to-primary-glow text-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Top Up Wallet
        </Button>
      </div>

      <div className="w-full">
        <Card className="w-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Balance
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground/80 hover:text-primary-foreground"
              onClick={() => selectedOrganization && fetchWalletBalance(selectedOrganization.uuid)}
              disabled={isBalanceLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isBalanceLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-lg mt-1 font-bold">
                {walletBalance ?? "₦0.00"}
              </div>
            )}
            <p className="text-xs text-primary-foreground/80 mt-1">
              Available for vending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Top-ups</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₦{totalTopUps.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingTransactions}</div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    View all your wallet transactions and their status.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => selectedOrganization && fetchTransactions(selectedOrganization.uuid)}
                    disabled={isTransactionsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isTransactionsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-5 w-[80px] mb-1" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.transaction_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ArrowUpDown className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium">{truncateText(transaction.title)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={transaction.status === 'success' ? 'default' : 'secondary'}
                          className="mb-1 text-xs sm:text-sm"
                        >
                          {transaction.amount}
                        </Badge>
                        <p className="text-xs capitalize"
                          style={{
                            color: transaction.status === 'success' ? 'green' : transaction.status === 'failed' ? 'red' : 'orange'
                          }}
                        >
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}