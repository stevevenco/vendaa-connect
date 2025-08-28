import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  Droplets, 
  Flame, 
  CreditCard, 
} from "lucide-react";
import { dummyMeters } from "@/data/dummyData";
import EngineeringTokenCard from "@/components/EngineeringTokenCard";
import RemoteOperationCard from "@/components/RemoteOperationCard";

export default function VendingPage() {
  const [selectedMeter, setSelectedMeter] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("credit"); // State for dropdown/tab selection

  const tabOptions = [
    { value: "credit", label: "Credit Purchase" },
    { value: "engineering", label: "Engineering Tokens" },
    { value: "remote", label: "Remote Operations" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vending Operations</h1>
          <p className="text-muted-foreground">
            Generate utility credits and engineering tokens for your meters.
          </p>
        </div>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Zap className="h-5 w-5" />
              Electricity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dummyMeters.filter(m => m.meterType === 'electricity').length}
            </div>
            <p className="text-sm text-muted-foreground">Active meters</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Droplets className="h-5 w-5" />
              Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dummyMeters.filter(m => m.meterType === 'water').length}
            </div>
            <p className="text-sm text-muted-foreground">Active meters</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Flame className="h-5 w-5" />
              Gas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Active meters</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Mobile View: Dropdown */}
      <div className="md:hidden space-y-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger>
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab === "credit" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Generate Utility Credits
              </CardTitle>
              <CardDescription>
                Purchase utility credits for electricity, water, or gas meters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Meter</Label>
                  <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose meter number" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyMeters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.meterNumber}>
                          {meter.meterNumber} - {meter.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Credit Amount (NGN)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100"
                    step="50"
                  />
                </div>
              </div>

              {selectedMeter && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Meter Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{dummyMeters.find(m => m.meterNumber === selectedMeter)?.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span>₦{dummyMeters.find(m => m.meterNumber === selectedMeter)?.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meter Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {dummyMeters.find(m => m.meterNumber === selectedMeter)?.meterType}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                disabled={!selectedMeter || !amount}
              >
                Generate Credit Token
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "engineering" && <EngineeringTokenCard />}

        {activeTab === "remote" && <RemoteOperationCard />}
      </div>

      {/* Desktop View: Tabs */}
      <Tabs defaultValue="credit" className="hidden md:block space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credit">Credit Purchase</TabsTrigger>
          <TabsTrigger value="engineering">Engineering Tokens</TabsTrigger>
          <TabsTrigger value="remote">Remote Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Generate Utility Credits
              </CardTitle>
              <CardDescription>
                Purchase utility credits for electricity, water, or gas meters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Meter</Label>
                  <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose meter number" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyMeters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.meterNumber}>
                          {meter.meterNumber} - {meter.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Credit Amount (NGN)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100"
                    step="50"
                  />
                </div>
              </div>

              {selectedMeter && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Meter Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{dummyMeters.find(m => m.meterNumber === selectedMeter)?.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span>₦{dummyMeters.find(m => m.meterNumber === selectedMeter)?.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meter Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {dummyMeters.find(m => m.meterNumber === selectedMeter)?.meterType}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                disabled={!selectedMeter || !amount}
              >
                Generate Credit Token
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engineering" className="space-y-4">
          <EngineeringTokenCard />
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <RemoteOperationCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}