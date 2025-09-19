import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Gauge,
  Plus,
  Search,
  Upload,
  Eye,
  Edit,
  Zap,
  Droplets,
  Flame,
  Trash2,
  Loader2
} from "lucide-react";
import { useOrganizations } from "@/hooks/useOrganizations";
import { getMeters, createMeter, deleteMeter, ApiError } from "@/services/api";
import { Meter, CreateMeterSchema, TCreateMeterSchema, PaginatedResponse } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MetersPage() {
  const { selectedOrganization } = useOrganizations();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [metersResponse, setMetersResponse] = useState<PaginatedResponse<Meter> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const [meterToDelete, setMeterToDelete] = useState<Meter | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const fetchMeters = useCallback(async (page = 1, size = 10) => {
    if (!selectedOrganization) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeters(selectedOrganization.uuid, page, size);
      setMetersResponse(data);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to fetch meters.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    if (selectedOrganization) {
      fetchMeters(currentPage, pageSize);
    }
  }, [selectedOrganization, currentPage, pageSize, fetchMeters]);

  const form = useForm<TCreateMeterSchema>({
    resolver: zodResolver(CreateMeterSchema),
    defaultValues: {
      customer_name: "",
      meter_number: "",
      email: "",
      phone: "",
      address: "",
      sgc: "",
      tariff_index: "",
      key_revision_number: "",
      meter_type: "electricity",
    },
  });

  const onSubmit = async (values: TCreateMeterSchema) => {
    if (!selectedOrganization) return;
    setIsSubmitting(true);
    try {
      await createMeter(selectedOrganization.uuid, values);
      toast({
        title: "Success",
        description: "Meter created successfully.",
      });
      form.reset();
      fetchMeters(1, pageSize); // Refresh the list to the first page
      setActiveTab("list");
    } catch (err) {
      if (err instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create meter.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!meterToDelete || !selectedOrganization) return;
    try {
      await deleteMeter(selectedOrganization.uuid, meterToDelete.uuid);
      toast({
        title: "Success",
        description: "Meter deleted successfully.",
      });
      // Refresh the current page
      fetchMeters(currentPage, pageSize);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete meter.",
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setMeterToDelete(null);
    }
  };

  const openDeleteAlert = (meter: Meter) => {
    setMeterToDelete(meter);
    setIsDeleteAlertOpen(true);
  };

  const meters = metersResponse?.results || [];

  const filteredMeters = meters.filter(meter =>
    meter.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  const handlePageChange = (page: number) => {
    fetchMeters(page, pageSize);
  };

  const getPaginationRange = (totalPages: number, currentPage: number, siblingCount: number = 1) => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    return [];
  };
  
  const paginationRange = metersResponse ? getPaginationRange(metersResponse.total_pages, currentPage) : [];


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
          <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow" onClick={() => setActiveTab("add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Meter
          </Button>
        </div>
      </div>

      <div className="flex md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto snap-x snap-mandatory space-x-4 md:space-x-0 pb-4">
        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Meters</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metersResponse?.count ?? 0}</div>
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
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : meters.filter(m => m.meter_type === 'electricity').length}
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
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : meters.filter(m => m.meter_type === 'water').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active water meters
            </p>
          </CardContent>
        </Card>
        <Card className="min-w-[160px] snap-start md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Gas</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : meters.filter(m => m.meter_type === 'gas').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active gas meters
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
              <CardDescription className="text-xs sm:text-sm pt-2">
                The search will be applied to the current page only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Meter Info</TableHead>
                    <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-xs sm:text-sm">Type</TableHead>
                    <TableHead className="text-xs sm:text-sm">Key Rev No.</TableHead>
                    <TableHead className="text-xs sm:text-sm">Added</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredMeters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No meters found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMeters.map((meter) => (
                      <TableRow key={meter.uuid}>
                        <TableCell className="text-xs sm:text-sm">
                          <div>
                            <div className="font-medium">{truncateText(meter.meter_number)}</div>
                            <div className="text-xs text-muted-foreground">
                              SGC: {truncateText(meter.sgc)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div>
                            <div className="font-medium">{truncateText(meter.customer_name)}</div>
                            <div className="text-xs text-muted-foreground">
                              {truncateText(meter.address, 20)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            {getMeterIcon(meter.meter_type)}
                            <span className="capitalize">{truncateText(meter.meter_type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="outline">
                            {meter.key_revision_number}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(meter.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/meters/${meter.uuid}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => openDeleteAlert(meter)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
               <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {metersResponse?.total_pages}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (metersResponse?.links?.previous) {
                            handlePageChange(currentPage - 1);
                          }
                        }}
                        className={!metersResponse?.links?.previous ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {paginationRange.map((pageNumber, index) => {
                      if (pageNumber === '...') {
                        return <PaginationEllipsis key={`ellipsis-${index}`} />;
                      }
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNumber as number);
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (metersResponse?.links?.next) {
                            handlePageChange(currentPage + 1);
                          }
                        }}
                        className={!metersResponse?.links?.next ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
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
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer name" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meter_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Meter Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter meter number" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="customer@example.com" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+234-xxx-xxx-xxxx" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs sm:text-sm">Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter customer address" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sgc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">SGC</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SGC" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tariff_index"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Tariff Index</FormLabel>
                          <FormControl>
                            <Input placeholder="T1, T2, etc." {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="key_revision_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Key Revision Number</FormLabel>
                          <FormControl>
                            <Input placeholder="001, 002, etc." {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meter_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Meter Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select a meter type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="electricity">Electricity</SelectItem>
                              <SelectItem value="water">Water</SelectItem>
                              <SelectItem value="gas">Gas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Meter
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meter
              <span className="font-bold"> {meterToDelete?.meter_number}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}