import { useState, useEffect } from "react";
import { useOrganization } from "@/context/useOrganization";
import { getAllTransactions, getAllUtilityVends, getUtilityVends, getTransactions } from "@/services/api";
import { PaginatedResponse, UtilityVend, Transaction } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { VendingDetailsModal } from "@/components/VendingDetailsModal";
import { WalletTransactionDetailsModal } from "@/components/WalletTransactionDetailsModal";
import {
  FileText,
  Download,
  Filter,
  BarChart3,
  Activity,
  Shield,
  Wrench,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { dummyTransactions, dummyReports } from "@/data/dummyData";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("transactions");
  const { selectedOrganization } = useOrganization();
  const [creditGenerationData, setCreditGenerationData] = useState(dummyReports.creditGenerated);
  const [utilityDistributionData, setUtilityDistributionData] = useState([
    { name: 'Electricity', value: 0, color: 'hsl(var(--primary))' },
    { name: 'Water', value: 0, color: 'hsl(var(--accent))' },
    { name: 'Gas', value: 0, color: 'hsl(var(--warning))' },
  ]);
  const [totalTransactionsThisMonth, setTotalTransactionsThisMonth] = useState(0);
  const [engineeringTokensThisMonth, setEngineeringTokensThisMonth] = useState(0);
  const [managementTokensThisMonth, setManagementTokensThisMonth] = useState(0);
  const [creditTokensThisMonth, setCreditTokensThisMonth] = useState(0);

  // New state for wallet transactions
  const [walletTransactions, setWalletTransactions] = useState<PaginatedResponse<Transaction> | null>(null);
  const [isWalletTransactionsLoading, setIsWalletTransactionsLoading] = useState(true);
  const [walletTransactionsError, setWalletTransactionsError] = useState<string | null>(null);
  const [currentWalletTransactionPage, setCurrentWalletTransactionPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isWalletDetailsModalOpen, setIsWalletDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedOrganization) {
      const fetchData = async () => {
        try {
          const [transactions, utilityVends] = await Promise.all([
            getAllTransactions(selectedOrganization.uuid),
            getAllUtilityVends(selectedOrganization.uuid),
          ]);

          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // Process transactions
          const thisMonthTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.created_at);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
          });
          setTotalTransactionsThisMonth(thisMonthTransactions.length);

          // Process engineering tokens
          const thisMonthEngineeringTokens = utilityVends.filter(vend => {
            const vendDate = new Date(vend.created);
            return vend.token_type !== 'credit' && vend.token_type !== 'mgtk' && vendDate.getMonth() === currentMonth && vendDate.getFullYear() === currentYear;
          });
          setEngineeringTokensThisMonth(thisMonthEngineeringTokens.length);

          // Process management tokens
          const thisMonthManagementTokens = utilityVends.filter(vend => {
            const vendDate = new Date(vend.created);
            return vend.token_type === 'mgtk' && vendDate.getMonth() === currentMonth && vendDate.getFullYear() === currentYear;
          });
          setManagementTokensThisMonth(thisMonthManagementTokens.length);

          // Process credit tokens
          const thisMonthCreditTokens = utilityVends.filter(vend => {
            const vendDate = new Date(vend.created);
            return vend.token_type === 'credit' && vendDate.getMonth() === currentMonth && vendDate.getFullYear() === currentYear;
          });
          setCreditTokensThisMonth(thisMonthCreditTokens.length);

        } catch (error) {
          console.error("Failed to fetch report data:", error);
        }
      };

      fetchData();
    }
  }, [selectedOrganization]);

  useEffect(() => {
    if (selectedOrganization) {
      const fetchData = async () => {
        try {
          const utilityVends: UtilityVend[] = await getAllUtilityVends(selectedOrganization.uuid);
          const now = new Date();
          const currentYear = now.getFullYear();

          // Process data for credit generation trend
          const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            amount: 0,
          }));

          // Process data for utility distribution
          const distribution: { [key: string]: number } = {
            electricity: 0,
            water: 0,
            gas: 0,
          };

          utilityVends.forEach(vend => {
            // Credit generation data
            const vendDate = new Date(vend.created);
            if (vendDate.getFullYear() === currentYear) {
              const monthIndex = vendDate.getMonth();
              monthlyData[monthIndex].amount += parseFloat(vend.amount);
            }

            // Utility distribution data
            if (vend.meter_type && distribution.hasOwnProperty(vend.meter_type)) {
              distribution[vend.meter_type] += 1;
            }
          });

          setCreditGenerationData(monthlyData);

          const newPieData = [
            { name: 'Electricity', value: distribution.electricity, color: 'hsl(var(--primary))' },
            { name: 'Water', value: distribution.water, color: 'hsl(var(--accent))' },
            { name: 'Gas', value: distribution.gas, color: 'hsl(var(--warning))' },
          ];
          setUtilityDistributionData(newPieData);

        } catch (error) {
          console.error("Failed to fetch utility vends:", error);
          // Fallback to dummy data in case of an error
          setCreditGenerationData(dummyReports.creditGenerated);
          setUtilityDistributionData([
            { name: 'Electricity', value: 65, color: 'hsl(var(--primary))' },
            { name: 'Water', value: 25, color: 'hsl(var(--accent))' },
            { name: 'Gas', value: 10, color: 'hsl(var(--warning))' },
          ]);
        }
      };

      fetchData();
    }
  }, [selectedOrganization]);

  const [creditTransactions, setCreditTransactions] = useState<PaginatedResponse<UtilityVend> | null>(null);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [selectedVend, setSelectedVend] = useState<UtilityVend | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // State for Engineering Tokens
  const [engineeringTokens, setEngineeringTokens] = useState<PaginatedResponse<UtilityVend> | null>(null);
  const [isEngineeringTokensLoading, setIsEngineeringTokensLoading] = useState(true);
  const [engineeringTokensError, setEngineeringTokensError] = useState<string | null>(null);
  const [currentEngineeringTokensPage, setCurrentEngineeringTokensPage] = useState(1);

  // State for Management Tokens
  const [managementTokens, setManagementTokens] = useState<PaginatedResponse<UtilityVend> | null>(null);
  const [isManagementTokensLoading, setIsManagementTokensLoading] = useState(true);
  const [managementTokensError, setManagementTokensError] = useState<string | null>(null);
  const [currentManagementTokensPage, setCurrentManagementTokensPage] = useState(1);

  useEffect(() => {
    if (selectedOrganization) {
      const fetchWalletTransactions = async () => {
        setIsWalletTransactionsLoading(true);
        setWalletTransactionsError(null);
        try {
          const data = await getTransactions(selectedOrganization.uuid, currentWalletTransactionPage, 10);
          setWalletTransactions(data);
        } catch (error) {
          console.error("Failed to fetch wallet transactions:", error);
          setWalletTransactionsError("Failed to load wallet transactions.");
        } finally {
          setIsWalletTransactionsLoading(false);
        }
      };

      fetchWalletTransactions();
    }
  }, [selectedOrganization, currentWalletTransactionPage]);


  useEffect(() => {
    if (selectedOrganization) {
      const fetchTransactions = async () => {
        setIsTransactionsLoading(true);
        setTransactionsError(null);
        try {
          const data = await getUtilityVends(selectedOrganization.uuid, currentTransactionPage, 10, 'credit');
          setCreditTransactions(data);
        } catch (error) {
          console.error("Failed to fetch credit transactions:", error);
          setTransactionsError("Failed to load credit transactions.");
        } finally {
          setIsTransactionsLoading(false);
        }
      };

      fetchTransactions();
    }
  }, [selectedOrganization, currentTransactionPage]);

  useEffect(() => {
    if (selectedOrganization) {
      const fetchEngineeringTokens = async () => {
        setIsEngineeringTokensLoading(true);
        setEngineeringTokensError(null);
        try {
          const tokenTypes = ['kct', 'clear_credit', 'clear_tamper', 'mode_change'];
          const data = await getUtilityVends(selectedOrganization.uuid, currentEngineeringTokensPage, 10, tokenTypes);
          setEngineeringTokens(data);
        } catch (error) {
          console.error("Failed to fetch engineering tokens:", error);
          setEngineeringTokensError("Failed to load engineering tokens.");
        } finally {
          setIsEngineeringTokensLoading(false);
        }
      };

      fetchEngineeringTokens();
    }
  }, [selectedOrganization, currentEngineeringTokensPage]);

  useEffect(() => {
    if (selectedOrganization) {
      const fetchManagementTokens = async () => {
        setIsManagementTokensLoading(true);
        setManagementTokensError(null);
        try {
          const data = await getUtilityVends(selectedOrganization.uuid, currentManagementTokensPage, 10, 'mgtk');
          setManagementTokens(data);
        } catch (error) {
          console.error("Failed to fetch management tokens:", error);
          setManagementTokensError("Failed to load management tokens.");
        } finally {
          setIsManagementTokensLoading(false);
        }
      };

      fetchManagementTokens();
    }
  }, [selectedOrganization, currentManagementTokensPage]);

  const truncateText = (text: string | null | undefined, maxLength: number = 15) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const tabOptions = [
    { value: "transactions", label: "Transactions" },
    { value: "engineering", label: "Engineering Tokens" },
    { value: "management", label: "Management Tokens" },
    { value: "credit", label: "Credit Tokens" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive reports and analytics for your utility operations.
          </p>
        </div>
        {/* Future Implementation */}
        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-6 w-4" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div> */}
      </div>

      {/* Overview Cards */}
      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-m Merry space-x-4 md:space-x-0 pb-4">
        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{totalTransactionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Wallet transactions
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Engineering Tokens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{engineeringTokensThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Management Tokens</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{managementTokensThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Actions performed
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Credit Tokens</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{creditTokensThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View: Dropdown */}
      <div className="md:hidden space-y-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-sm">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Credit Generation Trend</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Monthly credit purchases across utility types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={creditGenerationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Utility Distribution</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Token purchases by utility type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={utilityDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {utilityDistributionData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">All Wallet Transactions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  A comprehensive log of all wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                      <TableHead className="text-xs sm:text-sm">Title</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isWalletTransactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading transactions...</TableCell>
                      </TableRow>
                    ) : walletTransactionsError ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-red-500">{walletTransactionsError}</TableCell>
                      </TableRow>
                    ) : walletTransactions?.results?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No wallet transactions found.</TableCell>
                      </TableRow>
                    ) : (
                      walletTransactions?.results?.map((transaction) => (
                        <TableRow key={transaction.transaction_id}>
                          <TableCell className="text-xs sm:text-sm">
                            <div>
                              <div className="font-medium">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{transaction.title}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant="secondary">
                              ₦{parseFloat(transaction.amount).toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant={transaction.status === 'success' ? 'success' : ''}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedTransactionId(transaction.transaction_id);
                              setIsWalletDetailsModalOpen(true);
                            }}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {walletTransactions && walletTransactions.total_pages > 1 && (
                  <div className="flex justify-center pt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentWalletTransactionPage(prev => Math.max(prev - 1, 1));
                            }}
                            className={!walletTransactions.links.previous ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm font-medium">
                            Page {currentWalletTransactionPage} of {walletTransactions.total_pages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentWalletTransactionPage(prev => Math.min(prev + 1, walletTransactions.total_pages));
                            }}
                            className={!walletTransactions.links.next ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "engineering" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Engineering Tokens Report</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                All engineering tokens generated for meter operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                    <TableHead className="text-xs sm:text-sm">Token Type</TableHead>
                    <TableHead className="text-xs sm:text-sm">Meter Number</TableHead>
                    <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm">Token</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isEngineeringTokensLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading tokens...</TableCell>
                    </TableRow>
                  ) : engineeringTokensError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-red-500">{engineeringTokensError}</TableCell>
                    </TableRow>
                  ) : engineeringTokens?.results?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No engineering tokens found.</TableCell>
                    </TableRow>
                  ) : (
                    engineeringTokens?.results?.map((token) => (
                      <TableRow key={token.uuid}>
                        <TableCell className="text-xs sm:text-sm">
                          <div>
                            <div className="font-medium">{new Date(token.created).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{new Date(token.created).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm"><Badge>{token.token_type?.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-xs sm:text-sm">{token.meter_number}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="secondary">
                            ₦{parseFloat(token.amount).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{token.token[0]}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedVend(token);
                            setIsDetailsModalOpen(true);
                          }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {engineeringTokens && engineeringTokens.total_pages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentEngineeringTokensPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={!engineeringTokens.links.previous ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm font-medium">
                          Page {currentEngineeringTokensPage} of {engineeringTokens.total_pages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentEngineeringTokensPage(prev => Math.min(prev + 1, engineeringTokens.total_pages));
                          }}
                          className={!engineeringTokens.links.next ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "management" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Management Token</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Log of all meter management tokens performed on meters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                    <TableHead className="text-xs sm:text-sm">Operation</TableHead>
                    <TableHead className="text-xs sm:text-sm">Action</TableHead>
                    <TableHead className="text-xs sm:text-sm">Meter Number</TableHead>
                    <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm">Token</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isManagementTokensLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading tokens...</TableCell>
                    </TableRow>
                  ) : managementTokensError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">{managementTokensError}</TableCell>
                    </TableRow>
                  ) : managementTokens?.results?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No management tokens found.</TableCell>
                    </TableRow>
                  ) : (
                    managementTokens?.results?.map((token) => (
                      <TableRow key={token.uuid}>
                        <TableCell className="text-xs sm:text-sm">
                          <div>
                            <div className="font-medium">{new Date(token.created).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{new Date(token.created).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline">{truncateText(token.token_class)}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline">{truncateText(token.token_sub_class)}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{truncateText(token.meter_number)}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="secondary">
                            ₦{parseFloat(token.amount).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{truncateText(token.token[0])}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedVend(token);
                            setIsDetailsModalOpen(true);
                          }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {managementTokens && managementTokens.total_pages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentManagementTokensPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={!managementTokens.links.previous ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm font-medium">
                          Page {currentManagementTokensPage} of {managementTokens.total_pages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentManagementTokensPage(prev => Math.min(prev + 1, managementTokens.total_pages));
                          }}
                          className={!managementTokens.links.next ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "credit" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Credit Tokens Generated</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Log of all credit tokens generated for utility purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                      <TableHead className="text-xs sm:text-sm">Meter Number</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-xs sm:text-sm">Token</TableHead>
                      {/* <TableHead className="text-xs sm:text-sm">Generated By</TableHead> */}
                      <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTransactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading transactions...</TableCell>
                      </TableRow>
                    ) : transactionsError ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-red-500">{transactionsError}</TableCell>
                      </TableRow>
                    ) : creditTransactions?.results?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No credit transactions found.</TableCell>
                      </TableRow>
                    ) : (
                      creditTransactions?.results?.map((transaction) => (
                        <TableRow key={transaction.uuid}>
                          <TableCell className="text-xs sm:text-sm">
                            <div>
                              <div className="font-medium">
                                {new Date(transaction.created).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.created).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{transaction.meter_number}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant="secondary">
                              ₦{parseFloat(transaction.amount).toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.token[0]}
                          </TableCell>
                           {/* <TableCell className="text-xs sm:text-sm">{transaction.initiated_by.substring(0, 8)}...</TableCell> */}
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedVend(transaction);
                              setIsDetailsModalOpen(true);
                            }}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                 {creditTransactions && creditTransactions.total_pages > 1 && (
                  <div className="flex justify-center pt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentTransactionPage(prev => Math.max(prev - 1, 1));
                            }}
                            className={!creditTransactions.links.previous ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm font-medium">
                            Page {currentTransactionPage} of {creditTransactions.total_pages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentTransactionPage(prev => Math.min(prev + 1, creditTransactions.total_pages));
                            }}
                            className={!creditTransactions.links.next ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View: Tabs */}
      <Tabs defaultValue="transactions" className="hidden md:block space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="engineering">Engineering Tokens</TabsTrigger>
          <TabsTrigger value="management">Management Tokens</TabsTrigger>
          <TabsTrigger value="credit">Credit Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Credit Generation Trend</CardTitle>
                <CardDescription>Monthly credit purchases across utility types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={creditGenerationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utility Distribution</CardTitle>
                <CardDescription>Token purchases by utility type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={utilityDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {utilityDistributionData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Wallet Transactions</CardTitle>
              <CardDescription>
                A comprehensive log of all wallet transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isWalletTransactionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading transactions...</TableCell>
                    </TableRow>
                  ) : walletTransactionsError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{walletTransactionsError}</TableCell>
                    </TableRow>
                  ) : walletTransactions?.results?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No wallet transactions found.</TableCell>
                    </TableRow>
                  ) : (
                    walletTransactions?.results?.map((transaction) => (
                      <TableRow key={transaction.transaction_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.title}</TableCell>
                        <TableCell>{transaction.event}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            ₦{parseFloat(transaction.amount).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'success' ? 'success' : ''}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedTransactionId(transaction.transaction_id);
                            setIsWalletDetailsModalOpen(true);
                          }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {walletTransactions && walletTransactions.total_pages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentWalletTransactionPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={!walletTransactions.links.previous ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm font-medium">
                          Page {currentWalletTransactionPage} of {walletTransactions.total_pages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentWalletTransactionPage(prev => Math.min(prev + 1, walletTransactions.total_pages));
                          }}
                          className={!walletTransactions.links.next ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engineering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engineering Tokens Report</CardTitle>
              <CardDescription>
                All engineering tokens generated for meter operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Token Type</TableHead>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isEngineeringTokensLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading tokens...</TableCell>
                    </TableRow>
                  ) : engineeringTokensError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">{engineeringTokensError}</TableCell>
                    </TableRow>
                  ) : engineeringTokens?.results?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No engineering tokens found.</TableCell>
                    </TableRow>
                  ) : (
                    engineeringTokens?.results?.map((token) => (
                      <TableRow key={token.uuid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{new Date(token.created).toLocaleDateString()}</div>
                            <div className="text-sm text-muted-foreground">{new Date(token.created).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge>{token.token_type?.toUpperCase()}</Badge></TableCell>
                        <TableCell>{token.meter_number}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            ₦{parseFloat(token.amount).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{token.token[0]}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedVend(token);
                            setIsDetailsModalOpen(true);
                          }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {engineeringTokens && engineeringTokens.total_pages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentEngineeringTokensPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={!engineeringTokens.links.previous ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm font-medium">
                          Page {currentEngineeringTokensPage} of {engineeringTokens.total_pages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentEngineeringTokensPage(prev => Math.min(prev + 1, engineeringTokens.total_pages));
                          }}
                          className={!engineeringTokens.links.next ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Management Tokens</CardTitle>
              <CardDescription>
                Log of all meter management tokens performed on meters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isManagementTokensLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading tokens...</TableCell>
                    </TableRow>
                  ) : managementTokensError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">{managementTokensError}</TableCell>
                    </TableRow>
                  ) : managementTokens?.results?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No management tokens found.</TableCell>
                    </TableRow>
                  ) : (
                    managementTokens?.results?.map((token) => (
                      <TableRow key={token.uuid}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{new Date(token.created).toLocaleDateString()}</div>
                            <div className="text-sm text-muted-foreground">{new Date(token.created).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{truncateText(token.token_class)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{truncateText(token.token_sub_class)}</Badge>
                        </TableCell>
                        <TableCell>{truncateText(token.meter_number)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            ₦{parseFloat(token.amount).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{truncateText(token.token[0])}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedVend(token);
                            setIsDetailsModalOpen(true);
                          }}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {managementTokens && managementTokens.total_pages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentManagementTokensPage(prev => Math.max(prev - 1, 1));
                          }}
                          className={!managementTokens.links.previous ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm font-medium">
                          Page {currentManagementTokensPage} of {managementTokens.total_pages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentManagementTokensPage(prev => Math.min(prev + 1, managementTokens.total_pages));
                          }}
                          className={!managementTokens.links.next ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Tokens Generated</CardTitle>
              <CardDescription>
                Log of all credit tokens generated for utility purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                      <TableHead className="text-xs sm:text-sm">Meter Number</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-xs sm:text-sm">Token</TableHead>
                      {/* <TableHead className="text-xs sm:text-sm">Generated By</TableHead> */}
                      <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTransactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading transactions...</TableCell>
                      </TableRow>
                    ) : transactionsError ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-red-500">{transactionsError}</TableCell>
                      </TableRow>
                    ) : creditTransactions?.results?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No credit transactions found.</TableCell>
                      </TableRow>
                    ) : (
                      creditTransactions?.results?.map((transaction) => (
                        <TableRow key={transaction.uuid}>
                          <TableCell className="text-xs sm:text-sm">
                            <div>
                              <div className="font-medium">
                                {new Date(transaction.created).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.created).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{transaction.meter_number}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant="secondary">
                              ₦{parseFloat(transaction.amount).toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.token[0]}
                          </TableCell>
                           {/* <TableCell className="text-xs sm:text-sm">{transaction.initiated_by.substring(0, 8)}...</TableCell> */}
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedVend(transaction);
                              setIsDetailsModalOpen(true);
                            }}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                 {creditTransactions && creditTransactions.total_pages > 1 && (
                  <div className="flex justify-center pt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentTransactionPage(prev => Math.max(prev - 1, 1));
                            }}
                            className={!creditTransactions.links.previous ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm font-medium">
                            Page {currentTransactionPage} of {creditTransactions.total_pages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentTransactionPage(prev => Math.min(prev + 1, creditTransactions.total_pages));
                            }}
                            className={!creditTransactions.links.next ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedVend && (
        <VendingDetailsModal
          vendUuid={selectedVend.uuid}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedVend(null);
          }}
        />
      )}
      {selectedTransactionId && (
        <WalletTransactionDetailsModal
          transactionId={selectedTransactionId}
          isOpen={isWalletDetailsModalOpen}
          onClose={() => {
            setIsWalletDetailsModalOpen(false);
            setSelectedTransactionId(null);
          }}
        />
      )}
    </div>
  );
};