import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Gauge, 
  Plus, 
  Search, 
  Upload, 
  Eye, 
  Edit, 
  Zap,
  Droplets,
  Flame
} from "lucide-react";
import { dummyMeters } from "@/data/dummyData";

export default function MetersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMeters = dummyMeters.filter(meter =>
    meter.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'water': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'gas': return <Flame className="h-4 w-4 text-orange-500" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  // Function to truncate text longer than 20 characters
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Meter Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage all meters across your organization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow">
            <Plus className="mr-2 h-4 w-4" />
            Add Meter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-mandatory space-x-4 md:space-x-0 pb-4">
        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Meters</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{dummyMeters.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all utility types
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Electricity</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {dummyMeters.filter(m => m.meterType === 'electricity').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active electricity meters
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Water</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {dummyMeters.filter(m => m.meterType === 'water').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active water meters
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Connected</CardTitle>
            <Gauge className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {dummyMeters.filter(m => m.relayStatus === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently connected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="text-sm sm:text-base">All Meters</TabsTrigger>
          <TabsTrigger value="add" className="text-sm sm:text-base">Add New Meter</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Meter List</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage all meters in your organization.
              </CardDescription>
              <div className="flex items-center space-x-2 pt-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search meters by number, name, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Meter Info</TableHead>
                    <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-xs sm:text-sm">Type</TableHead>
                    <TableHead className="text-xs sm:text-sm">Balance</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMeters.map((meter) => (
                    <TableRow key={meter.id}>
                      <TableCell className="text-xs sm:text-sm">
                        <div>
                          <div className="font-medium">{truncateText(meter.meterNumber)}</div>
                          <div className="text-xs text-muted-foreground">
                            SGC: {truncateText(meter.sgc)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div>
                          <div className="font-medium">{truncateText(meter.customerName)}</div>
                          <div className="text-xs text-muted-foreground">
                            {truncateText(meter.address, 20)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {getMeterIcon(meter.meterType)}
                          <span className="capitalize">{truncateText(meter.meterType)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline">
                          ₦{meter.balance.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge 
                          variant={meter.relayStatus === 'connected' ? 'default' : 'secondary'}
                        >
                          {truncateText(meter.relayStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Add New Meter</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Register a new meter and associate it with a customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Customer Name</label>
                  <Input placeholder="Enter customer name" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Meter Number</label>
                  <Input placeholder="Enter meter number" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Email</label>
                  <Input type="email" placeholder="customer@example.com" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Phone</label>
                  <Input placeholder="+234-xxx-xxx-xxxx" className="text-sm" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs sm:text-sm font-medium">Address</label>
                  <Input placeholder="Enter customer address" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">SGC</label>
                  <Input placeholder="Enter SGC" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Tariff Index</label>
                  <Input placeholder="T1, T2, etc." className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Key Revision Number</label>
                  <Input placeholder="001, 002, etc." className="text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Meter Type</label>
                  <select className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm">
                    <option>Electricity</option>
                    <option>Water</option>
                    <option>Gas</option>
                  </select>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
                Add Meter
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}