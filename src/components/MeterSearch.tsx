import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Meter } from "@/types";

interface MeterSearchProps {
  meters: Meter[];
  onSelect: (meterNumber: string) => void;
  selectedMeter: string;
  loading: boolean;
}

export default function MeterSearch({
  meters,
  onSelect,
  selectedMeter,
  loading,
}: MeterSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMeters = useMemo(() => {
    return meters.filter(
      (meter) =>
        meter.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [meters, searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {selectedMeter
            ? meters.find((meter) => meter.meter_number === selectedMeter)
                ?.meter_number
            : loading
            ? "Loading meters..."
            : "Select meter..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search meter by number, name, address..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No meter found.</CommandEmpty>
            <CommandGroup>
              {filteredMeters.map((meter) => (
                <CommandItem
                  key={meter.uuid}
                  value={meter.meter_number}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === selectedMeter ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedMeter === meter.meter_number
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{meter.meter_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {meter.customer_name}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
