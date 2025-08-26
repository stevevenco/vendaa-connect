import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Gauge, Zap, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { dummyWallet, dummyReports, dummyTransactions, dummyMeters } from "@/data/dummyData";

const chartData = [
  { month: "Jan", electricity: 45000, water: 18000, gas: 12000 },
  { month: "Feb", electricity: 52000, water: 21000, gas: 15000 },
  { month: "Mar", electricity: 48000, water: 19000, gas: 13000 },
  { month: "Apr", electricity: 58000, water: 23000, gas: 17000 },
  { month: "May", electricity: 63000, water: 25000, gas: 19000 },
  { month: "Jun", electricity: 61000, water: 24000, gas: 18000 },
];

export default function Dashboard() {
  const recentVends = dummyTransactions.filter(t => t.type === 'credit_purchase').slice(0, 5);
  const activeMeters = dummyMeters.filter(m => m.status === 'active').length;

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
        <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          Quick Top-up
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-mandatory space-x-4 md:space-x-0 pb-4">
        <Card className="min-w-[160px] snap-start md:min-w-0 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              ₦{dummyWallet.balance.toLocaleString()}
            </div>
            <p className="text-xs text-primary-foreground/80">
              +₦10,000 from last top-up
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">₦342,891</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Meters</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{activeMeters}</div>
            <p className="text-xs text-muted-foreground">
              2 meters added this week
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Vends Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +3 from yesterday
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
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Wallet Activity Trend</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Track your wallet balance and spending patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dummyReports.creditGenerated}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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