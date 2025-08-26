import { useState } from "react";
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
  FileText, 
  Download, 
  Filter,
  BarChart3,
  Activity,
  Shield,
  Wrench
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { dummyTransactions, dummyReports } from "@/data/dummyData";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("transactions");
  const creditTransactions = dummyTransactions.filter(t => t.type === 'credit_purchase');
  const walletTransactions = dummyTransactions.filter(t => t.type === 'wallet_topup');

  const pieData = [
    { name: 'Electricity', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Water', value: 25, color: 'hsl(var(--accent))' },
    { name: 'Gas', value: 10, color: 'hsl(var(--warning))' },
  ];

  const tabOptions = [
    { value: "transactions", label: "Transactions" },
    { value: "tokens", label: "Engineering Tokens" },
    { value: "remote", label: "Remote Actions" },
    { value: "security", label: "Security" },
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

      {/* Overview Cards */}
      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-m Merry space-x-4 md:space-x-0 pb-4">
        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{dummyTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Engineering Tokens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Remote Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Actions performed
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Login Sessions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              This week
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
                    <BarChart data={dummyReports.creditGenerated}>
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
                    Credit purchases by utility type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <CardTitle className="text-base sm:text-lg">Recent Credit Transactions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Latest utility credit purchases with transaction details
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
                      <TableHead className="text-xs sm:text-sm">Balance After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-xs sm:text-sm">
                          <div>
                            <div className="font-medium">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{transaction.meterNumber}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="secondary">
                            ₦{transaction.amount.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {transaction.token}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">₦{transaction.balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "tokens" && (
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
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Generated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">2024-01-15</div>
                        <div className="text-xs text-muted-foreground">10:30 AM</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge>Key Change Token</Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">MTR001234</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Applied
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">John Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">2024-01-14</div>
                        <div className="text-xs text-muted-foreground">3:45 PM</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="secondary">Clear Credit</Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">MTR005678</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Applied
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">Sarah Smith</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">2024-01-13</div>
                        <div className="text-xs text-muted-foreground">9:15 AM</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="destructive">Clear Tamper</Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">MTR001234</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Applied
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">John Doe</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "remote" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Remote Meter Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Log of all remote operations performed on meters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                    <TableHead className="text-xs sm:text-sm">Action</TableHead>
                    <TableHead className="text-xs sm:text-sm">Meter Number</TableHead>
                    <TableHead className="text-xs sm:text-sm">Result</TableHead>
                    <TableHead className="text-xs sm:text-sm">Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyReports.meterActions.map((action, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs sm:text-sm">
                        <div>
                          <div className="font-medium">{action.date}</div>
                          <div className="text-xs text-muted-foreground">Various times</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline">{action.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">Various</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Success ({action.count})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">System Users</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">User Login Activity</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Security log of user authentication and session activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Date/Time</TableHead>
                    <TableHead className="text-xs sm:text-sm">User</TableHead>
                    <TableHead className="text-xs sm:text-sm">IP Address</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">2024-01-15</div>
                        <div className="text-xs text-muted-foreground">8:30 AM</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">john.doe@technova.com</TableCell>
                    <TableCell className="text-xs sm:text-sm">192.168.1.100</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">Lagos, Nigeria</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">2024-01-14</div>
                        <div className="text-xs text-muted-foreground">4:45 PM</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">sarah.smith@technova.com</TableCell>
                    <TableCell className="text-xs sm:text-sm">192.168.1.105</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">Abuja, Nigeria</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">2024-01-13</div>
                        <div className="text-xs text-muted-foreground">11:20 AM</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">unknown@email.com</TableCell>
                    <TableCell className="text-xs sm:text-sm">203.45.67.89</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="destructive">
                        Failed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">Unknown</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop View: Tabs */}
      <Tabs defaultValue="transactions" className="hidden md:block space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tokens">Engineering Tokens</TabsTrigger>
          <TabsTrigger value="remote">Remote Actions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                  <BarChart data={dummyReports.creditGenerated}>
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
                <CardDescription>Credit purchases by utility type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <CardTitle>Recent Credit Transactions</CardTitle>
              <CardDescription>
                Latest utility credit purchases with transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
 Temos                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.meterNumber}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          ₦{transaction.amount.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.token}
                      </TableCell>
                      <TableCell>₦{transaction.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
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
                    <TableHead>Status</TableHead>
                    <TableHead>Generated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">2024-01-15</div>
                        <div className="text-sm text-muted-foreground">10:30 AM</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>Key Change Token</Badge>
                    </TableCell>
                    <TableCell>MTR001234</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Applied
                      </Badge>
                    </TableCell>
                    <TableCell>John Doe</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">2024-01-14</div>
                        <div className="text-sm text-muted-foreground">3:45 PM</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Clear Credit</Badge>
                    </TableCell>
                    <TableCell>MTR005678</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Applied
                      </Badge>
                    </TableCell>
                    <TableCell>Sarah Smith</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">2024-01-13</div>
                        <div className="text-sm text-muted-foreground">9:15 AM</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Clear Tamper</Badge>
                    </TableCell>
                    <TableCell>MTR001234</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Applied
                      </Badge>
                    </TableCell>
                    <TableCell>John Doe</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remote Meter Actions</CardTitle>
              <CardDescription>
                Log of all remote operations performed on meters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Meter Number</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyReports.meterActions.map((action, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{action.date}</div>
                          <div className="text-sm text-muted-foreground">Various times</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{action.action}</Badge>
                      </TableCell>
                      <TableCell>Various</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Success ({action.count})
                        </Badge>
                      </TableCell>
                      <TableCell>System Users</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Login Activity</CardTitle>
              <CardDescription>
                Security log of user authentication and session activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">2024-01-15</div>
                        <div className="text-sm text-muted-foreground">8:30 AM</div>
                      </div>
                    </TableCell>
                    <TableCell>john.doe@technova.com</TableCell>
                    <TableCell>192.168.1.100</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>Lagos, Nigeria</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">2024-01-14</div>
                        <div className="text-sm text-muted-foreground">4:45 PM</div>
                      </div>
                    </TableCell>
                    <TableCell>sarah.smith@technova.com</TableCell>
                    <TableCell>192.168.1.105</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>Abuja, Nigeria</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">2024-01-13</div>
                        <div className="text-sm text-muted-foreground">11:20 AM</div>
                      </div>
                    </TableCell>
                    <TableCell>unknown@email.com</TableCell>
                    <TableCell>203.45.67.89</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        Failed
                      </Badge>
                    </TableCell>
                    <TableCell>Unknown</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}