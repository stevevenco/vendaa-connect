import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, RefreshCw, Gauge, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useTopUp } from "@/hooks/useTopUp";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Transaction } from "@/types";

// Helper function to process transactions for the wallet activity chart
const processTransactionsForChart = (transactions: Transaction[], month: number, year: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTotals: { [key: string]: number } = {};

  transactions.forEach(tx => {
    const txDate = new Date(tx.created_at);
    if (txDate.getMonth() + 1 === month && txDate.getFullYear() === year) {
      const day = txDate.getDate().toString();
      const amount = parseFloat(tx.amount.replace(/[^0-9.-]+/g, ''));
      if (!dailyTotals[day]) {
        dailyTotals[day] = 0;
      }
      dailyTotals[day] += amount;
    }
  });

  const chartData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    chartData.push({
      day: day.toString(),
      amount: dailyTotals[day.toString()] || 0,
    });
  }
  return chartData;
};

export default function Dashboard() {
  const {
    walletBalance,
    isLoading: isOrgLoading,
    selectedOrganization,
    fetchWalletBalance,
    isBalanceLoading,
    walletActivityTransactions,
    isWalletActivityTransactionsLoading,
    fetchWalletActivityTransactions,
  } = useOrganizations();
  const { openModal } = useTopUp();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (selectedOrganization) {
      fetchWalletActivityTransactions(selectedOrganization.uuid, currentMonth);
    }
  }, [selectedOrganization, currentMonth, fetchWalletActivityTransactions]);

  const walletActivityData = processTransactionsForChart(
    walletActivityTransactions,
    currentMonth,
    new Date().getFullYear()
  );

  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, currentMonth, 0).getDate();
  const ticks = [1, 5, 10, 15, 20, 25, daysInMonth];

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const isLoading = isOrgLoading || isDashboardLoading;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's what's happening with your utility platform.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          onClick={openModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Quick Top-up
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-mandatory space-x-4 md:space-x-0 pb-4">
        <Card className="w-72 flex-shrink-0 md:w-auto bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Wallet Balance</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground/80 hover:text-primary-foreground"
                onClick={() => selectedOrganization && fetchWalletBalance(selectedOrganization.uuid)}
                disabled={isBalanceLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isBalanceLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-lg mt-1 font-bold">
                {walletBalance ?? "₦0.00"}
              </div>
            )}
            <p className="text-xs text-primary-foreground/80">
              Available for vending
            </p>
          </CardContent>
        </Card>

        <Card className="w-72 flex-shrink-0 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Meters</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData.activeMeters}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total active meters
            </p>
          </CardContent>
        </Card>

        <Card className="w-72 flex-shrink-0 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vends Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardData.vendsToday}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Vends made today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Vending Chart */}
        <Card className="col-span-4 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Utility Vends Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monthly vending activity
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dashboardData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" name="Vends" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Vends */}
        <Card className="col-span-4 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Vends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your 5 most recent vends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between space-x-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                ))
              ) : (
                dashboardData.recentVends.map((vend) => (
                  <div
                    key={vend.vend_reference}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium">
                        {truncateText(vend.meter)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(vend.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        ₦{parseFloat(vend.amount).toLocaleString()}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {truncateText(vend.vend_reference || '')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Activity Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Wallet Activity Trend</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your wallet spending patterns over time
            </CardDescription>
          </div>
          <Select value={currentMonth.toString()} onValueChange={(value) => setCurrentMonth(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isWalletActivityTransactionsLoading ? (
            <div className="h-[200px] w-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={walletActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} ticks={ticks.map(String)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}