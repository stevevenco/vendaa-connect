import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useOrganization } from "@/context/useOrganization";
import { getMeter, updateMeter, ApiError } from "@/services/api";
import { Meter, UpdateMeterSchema, TUpdateMeterSchema } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Edit, Save } from "lucide-react";

export default function MeterDetailsPage() {
  const { meterId } = useParams<{ meterId: string }>();
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganization();
  const { toast } = useToast();

  const [meter, setMeter] = useState<Meter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchMeter = useCallback(async () => {
    if (!selectedOrganization || !meterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeter(selectedOrganization.uuid, meterId);
      setMeter(data);
    } catch (err) {
      setError("Failed to fetch meter details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization, meterId]);

  useEffect(() => {
    fetchMeter();
  }, [fetchMeter]);

  const form = useForm<TUpdateMeterSchema>({
    resolver: zodResolver(UpdateMeterSchema),
    defaultValues: {
      customer_name: "",
      email: "",
      phone: "",
      address: "",
      sgc: "",
      tariff_index: "",
      key_revision_number: "",
      meter_type: "electricity",
    },
  });

  useEffect(() => {
    if (meter) {
      form.reset({
        customer_name: meter.customer_name,
        email: meter.email,
        phone: meter.phone,
        address: meter.address,
        sgc: meter.sgc,
        tariff_index: meter.tariff_index,
        key_revision_number: meter.key_revision_number,
        meter_type: meter.meter_type,
      });
    }
  }, [meter, form]);

  const onSubmit = async (values: TUpdateMeterSchema) => {
    if (!selectedOrganization || !meterId) return;
    setIsSubmitting(true);
    try {
      const updatedMeter = await updateMeter(
        selectedOrganization.uuid,
        meterId,
        values
      );
      setMeter(updatedMeter);
      toast({
        title: "Success",
        description: "Meter details updated successfully.",
      });
      setIsEditDialogOpen(false);
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
          description: "Failed to update meter details.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
        <Button onClick={() => navigate("/meters")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="text-center">
        <p>Meter not found.</p>
        <Button onClick={() => navigate("/meters")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Button variant="outline" size="sm" onClick={() => navigate("/meters")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Meters
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Meter Details</CardTitle>
              <CardDescription>
                Viewing details for meter: {meter.meter_number}
              </CardDescription>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Meter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Edit Meter</DialogTitle>
                  <DialogDescription>
                    Update the customer and meter information.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>SGC</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Tariff Index</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Key Revision Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Meter Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meter type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="electricity">
                                Electricity
                              </SelectItem>
                              <SelectItem value="water">Water</SelectItem>
                              <SelectItem value="gas">Gas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Customer Information</h3>
            <div className="text-sm">
              <strong>Name:</strong> {meter.customer_name}
            </div>
            <div className="text-sm">
              <strong>Email:</strong> {meter.email}
            </div>
            <div className="text-sm">
              <strong>Phone:</strong> {meter.phone}
            </div>
            <div className="text-sm">
              <strong>Address:</strong> {meter.address}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Meter Specifications</h3>
            <div className="text-sm">
              <strong>SGC:</strong> {meter.sgc}
            </div>
            <div className="text-sm">
              <strong>Tariff Index:</strong> {meter.tariff_index}
            </div>
            <div className="text-sm">
              <strong>Key Revision No.:</strong> {meter.key_revision_number}
            </div>
            <div className="text-sm">
              <strong>Type:</strong> <span className="capitalize">{meter.meter_type}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <p>
            Meter added on {new Date(meter.created).toLocaleDateString()} and
            last updated on {new Date(meter.last_updated).toLocaleDateString()}.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
