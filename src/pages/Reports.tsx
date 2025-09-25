import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart, BarChart, Bar, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useReportsData } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, Filter, BarChart3, Wrench, Activity, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Reports = () => {
  const {
    totalTransactions,
    engineeringTokens,
    managementTokens,
    creditTokens,
    creditGenerationTrend,
    utilityDistribution,
    recentCreditTransactions,
    engineeringTokensReport,
    managementTokensReport,
    engineeringTokensPage,
    setEngineeringTokensPage,
    managementTokensPage,
    setManagementTokensPage,
    engineeringTokensTotalPages,
    managementTokensTotalPages,
    isLoading,
  } = useReportsData();
  const [selectedVend, setSelectedVend] = useState<UtilityVend | null>(null);

  const creditTrendChartData = creditGenerationTrend.map((vend) => ({
    month: new Date(vend.created).toLocaleString("default", { month: "short" }),
    amount: parseFloat(vend.amount),
  }));

  const utilityDistributionChartData = [
    { name: "Electricity", value: utilityDistribution.electricity, fill: "var(--color-electricity)" },
    { name: "Water", value: utilityDistribution.water, fill: "var(--color-water)" },
    { name: "Gas", value: utilityDistribution.gas, fill: "var(--color-gas)" },
  ];

  const chartConfig: ChartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
    electricity: {
      label: "Electricity",
      color: "hsl(var(--chart-1))",
    },
    water: {
      label: "Water",
      color: "hsl(var(--chart-2))",
    },
    gas: {
      label: "Gas",
      color: "hsl(var(--chart-3))",
    },
  };

  if (isLoading) {
    return (
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-96 xl:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
       <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive reports and analytics for your utility operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-6 w-4" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engineering Tokens (This Month)</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineeringTokens}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Management Tokens (This Month)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managementTokens}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Tokens (This Month)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditTokens}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Credit Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meter Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCreditTransactions.map((vend) => (
                  <TableRow key={vend.uuid}>
                    <TableCell>{vend.meter_number}</TableCell>
                    <TableCell>{vend.amount}</TableCell>
                    <TableCell>
                      <Badge variant={vend.status === "successful" ? "default" : "destructive"}>
                        {vend.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(vend.created).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credit Generation Trend</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[200px]">
              <ChartContainer className="h-full w-full" config={chartConfig}>
                <BarChart data={creditTrendChartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                   <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Utility Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={utilityDistributionChartData} dataKey="value" nameKey="name" innerRadius={60} >
                {utilityDistributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="credit">
        <TabsList>
          <TabsTrigger value="credit">Credit Transactions</TabsTrigger>
          <TabsTrigger value="engineering">Engineering Tokens</TabsTrigger>
          <TabsTrigger value="management">Management Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>Recent Credit Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCreditTransactions.map((vend) => (
                    <TableRow key={vend.uuid} onClick={() => setSelectedVend(vend)} className="cursor-pointer">
                      <TableCell>{vend.meter_number}</TableCell>
                      <TableCell>{vend.amount}</TableCell>
                      <TableCell>{vend.token.join(", ")}</TableCell>
                      <TableCell>{vend.transaction}</TableCell>
                      <TableCell>
                        <Badge variant={vend.status === "successful" ? "default" : "destructive"}>
                          {vend.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(vend.created).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engineering">
          <Card>
            <CardHeader>
              <CardTitle>Engineering Tokens Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineeringTokensReport.map((vend) => (
                    <TableRow key={vend.uuid}>
                      <TableCell>{vend.meter_number}</TableCell>
                      <TableCell>{vend.token.join(", ")}</TableCell>
                      <TableCell>
                        <Badge variant={vend.status === "successful" ? "default" : "destructive"}>
                          {vend.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(vend.created).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setEngineeringTokensPage(engineeringTokensPage - 1)}
                      className={engineeringTokensPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    Page {engineeringTokensPage} of {engineeringTokensTotalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => setEngineeringTokensPage(engineeringTokensPage + 1)}
                      className={engineeringTokensPage === engineeringTokensTotalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>Management Tokens Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managementTokensReport.map((vend) => (
                    <TableRow key={vend.uuid}>
                      <TableCell>{vend.meter_number}</TableCell>
                      <TableCell>{vend.token.join(", ")}</TableCell>
                      <TableCell>
                        <Badge variant={vend.status === "successful" ? "default" : "destructive"}>
                          {vend.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(vend.created).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setManagementTokensPage(managementTokensPage - 1)}
                      className={managementTokensPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    Page {managementTokensPage} of {managementTokensTotalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => setManagementTokensPage(managementTokensPage + 1)}
                      className={managementTokensPage === managementTokensTotalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={!!selectedVend} onOpenChange={() => setSelectedVend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Details for transaction on meter {selectedVend?.meter_number}
            </DialogDescription>
          </DialogHeader>
          {selectedVend && (
            <div className="space-y-2">
              <p><strong>Meter Number:</strong> {selectedVend.meter_number}</p>
              <p><strong>Amount:</strong> {selectedVend.amount}</p>
              <p><strong>Status:</strong> {selectedVend.status}</p>
              <p><strong>Date:</strong> {new Date(selectedVend.created).toLocaleString()}</p>
              <p><strong>Token:</strong> {selectedVend.token.join(", ")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Reports;