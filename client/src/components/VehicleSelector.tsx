import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Car, Bike, Ship, Bus, Truck, Hammer, MoreHorizontal, Home } from "lucide-react";

const VEHICLE_TYPES = [
  { id: "car", name: "Car", icon: Car },
  { id: "motorcycle", name: "Motorcycle", icon: Bike },
  { id: "boat", name: "Boat/Watercraft", icon: Ship },
  { id: "bus", name: "Bus", icon: Bus },
  { id: "truck", name: "Truck", icon: Truck },
  { id: "construction", name: "Construction", icon: Hammer },
  { id: "rv", name: "RV/Camper", icon: Home },
  { id: "other", name: "Other", icon: MoreHorizontal },
];

interface VehicleInfo {
  type: string;
  make: string;
  model: string;
  year: string;
  engine: string;
  issue: string;
}

interface VehicleSelectorProps {
  onSubmit?: (info: VehicleInfo) => void;
  className?: string;
}

export default function VehicleSelector({ onSubmit, className }: VehicleSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    type: "",
    make: "",
    model: "",
    year: "",
    engine: "",
    issue: ""
  });
  
  const detailsFormRef = useRef<HTMLDivElement>(null);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setVehicleInfo(prev => ({ ...prev, type }));
    
    // Scroll to details form on mobile after a short delay to let the form render
    setTimeout(() => {
      if (detailsFormRef.current) {
        detailsFormRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 100);
  };

  const handleSubmit = () => {
    if (onSubmit && selectedType && vehicleInfo.issue.trim()) {
      onSubmit(vehicleInfo);
    }
  };

  const isFormValid = selectedType && vehicleInfo.issue.trim().length > 10;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tell Us About Your Vehicle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Type Selection */}
        <div>
          <Label className="text-base font-medium mb-3 block">What type of vehicle do you need help with?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {VEHICLE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col space-y-2 hover-elevate"
                  onClick={() => handleTypeSelect(type.id)}
                  data-testid={`button-vehicle-${type.id}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{type.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Details Form */}
        {selectedType && (
          <div ref={detailsFormRef} className="space-y-4 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make/Brand</Label>
                <Input
                  id="make"
                  placeholder="e.g., Toyota, Ford, Caterpillar"
                  value={vehicleInfo.make}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, make: e.target.value }))}
                  data-testid="input-make"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., Camry, F-150, 320D"
                  value={vehicleInfo.model}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
                  data-testid="input-model"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Select onValueChange={(value) => setVehicleInfo(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger data-testid="select-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: new Date().getFullYear() - 1970 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="engine">Engine/Power Info</Label>
                <Input
                  id="engine"
                  placeholder="e.g., 2.0L V4, Diesel, Electric"
                  value={vehicleInfo.engine}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, engine: e.target.value }))}
                  data-testid="input-engine"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="issue">Describe the issue you're experiencing *</Label>
              <Textarea
                id="issue"
                placeholder="Please describe what's wrong, any symptoms, when it happens, etc. The more details you provide, the better our mechanics can help you."
                className="min-h-24"
                value={vehicleInfo.issue}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, issue: e.target.value }))}
                data-testid="textarea-issue"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {vehicleInfo.issue.length}/500 characters (minimum 10)
              </p>
            </div>

            <Button 
              className="w-full" 
              disabled={!isFormValid}
              onClick={handleSubmit}
              data-testid="button-submit-vehicle-info"
            >
              Start Chat with Mechanic
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}