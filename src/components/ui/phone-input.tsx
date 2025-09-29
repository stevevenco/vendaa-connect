import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Input, InputProps } from "@/components/ui/input";
import countries from "@/data/country_phone_codes.json";

interface PhoneInputProps extends InputProps {
  onCountryChange: (country: { name: string; code: string }) => void;
  countryName: string;
  countryCode: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onCountryChange, countryName, countryCode, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    const countryOptions = Object.entries(countries).map(([name, code]) => ({
      name: name,
      code: code,
    }));

    return (
      <div className={cn("flex items-center", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between rounded-r-none"
            >
              {countryName
                ? `${countryName} (${countryCode})`
                : "Select country..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryOptions.map((option) => (
                    <CommandItem
                      key={option.name}
                      value={option.name}
                      onSelect={(currentValue) => {
                        const selectedOption = countryOptions.find(
                          (c) =>
                            c.name.toLowerCase() === currentValue.toLowerCase()
                        );
                        if (selectedOption) {
                          onCountryChange(selectedOption);
                        }
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          countryName === option.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.name} ({option.code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input type="tel" className="rounded-l-none" ref={ref} {...props} />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };