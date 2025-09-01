import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { dummyTransactions, dummyMeters } from "@/data/dummyData";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useTopUp } from "@/hooks/useTopUp";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartData = [
  { month: "Jan", electricity: 45000, water: 18000, gas: 12000 },
  { month: "Feb", electricity: 52000, water: 21000, gas: 15000 },
  { month: "Mar", electricity: 48000, water: 19000, gas: 13000 },
  { month: "Apr", electricity: 58000, water: 23000, gas: 17000 },
  { month: "May", electricity: 63000, water: 25000, gas: 19000 },
  { month: "Jun", electricity: 61000, water: 24000, gas: 18000 },
];

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
    isLoading,
    selectedOrganization,
    fetchWalletBalance,
    isBalanceLoading,
    transactions,
    isTransactionsLoading,
  } = useOrganizations();
  const { openModal } = useTopUp();
  const recentVends = dummyTransactions.filter(t => t.type === 'credit_purchase').slice(0, 5);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [walletActivityData, setWalletActivityData] = useState<any[]>([]);

  useEffect(() => {
    const year = new Date().getFullYear();
    if (transactions) {
      setWalletActivityData(processTransactionsForChart(transactions, currentMonth, year));
    }
  }, [currentMonth, transactions]);

  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, currentMonth, 0).getDate();
  const ticks = [1, 5, 10, 15, 20, 25, daysInMonth];

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

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
      <div className="w-full">
        <Card className="w-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
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
              <div className="text-lg sm:text-2xl font-bold">
                {walletBalance ?? "₦0.00"}
              </div>
            )}
            <p className="text-xs text-primary-foreground/80">
              Available for vending
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
              Monthly vending activity across all utility types
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="electricity" fill="hsl(var(--primary))" name="Electricity" />
                <Bar dataKey="water" fill="hsl(var(--accent))" name="Water" />
                <Bar dataKey="gas" fill="hsl(var(--warning))" name="Gas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Vends */}
        <Card className="col-span-4 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Vends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest utility credit purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVends.map((vend) => (
                <div
                  key={vend.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium">
                      {truncateText(vend.meterNumber)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(vend.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      ₦{vend.amount.toLocaleString()}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {truncateText(vend.token || '')}
                    </p>
                  </div>
                </div>
              ))}
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
              Track your wallet balance and spending patterns over time
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
        </CardContent>
      </Card>
    </div>
  );
}