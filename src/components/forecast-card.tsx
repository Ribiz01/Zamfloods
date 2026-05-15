"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateForecastAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import type { ForecastState } from "@/lib/types";
import { Check, ChevronsUpDown, Loader2, Zap } from "lucide-react";
import { zambiaDistricts } from "@/lib/zambia-districts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  region: z.string({ required_error: "Please select a region." }),
});

type FormValues = z.infer<typeof FormSchema>;

export function ForecastCard() {
  const [forecastState, setForecastState] = React.useState<ForecastState>({ status: 'idle', data: null, error: null });
  const [activeTab, setActiveTab] = React.useState<'form' | 'result'>('form');
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      region: "",
    },
  });

  const districts = React.useMemo(() => zambiaDistricts.sort((a, b) => a.name.localeCompare(b.name)), []);

  const filteredDistricts = React.useMemo(() => {
    if (!search) return districts;
    return districts.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, districts]);

  const onSubmit = async (data: FormValues) => {
    setForecastState({ status: 'loading', data: null, error: null });
    setActiveTab('result');

    const result = await generateForecastAction({
      region: data.region,
    });

    if (result.success) {
      setForecastState({ status: 'succeeded', data: result.data!, error: null });

      toast({
        title: "Forecast Generated",
        description: `Successfully generated forecast for ${result.data.forecastRegion}.`,
      });
    } else {
      setForecastState({ status: 'failed', data: null, error: result.error });
      toast({
        variant: "destructive",
        title: "Forecast Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  const riskLevelToColor = {
    'No Flood': 'text-green-600',
    'Moderate': 'text-yellow-600',
    'High': 'text-orange-600',
    'Extreme': 'text-red-700'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl font-semibold">Probabilistic Flood Forecast</CardTitle>
            <CardDescription>Generate a 24-72 hour forecast using real-time river discharge data.</CardDescription>
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
            <Button variant={activeTab === 'form' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('form')} className="px-3">Generator</Button>
            <Button variant={activeTab === 'result' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveTab('result')} className="px-3" disabled={forecastState.status === 'idle'}>Result</Button>
          </div>
        </div>
      </CardHeader>
      
      {activeTab === 'form' && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>District</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? districts.find(
                                  (district) => district.name === field.value
                                )?.name
                              : "Select a district to forecast"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <div className="p-2">
                          <Input
                            placeholder="Search district..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <ScrollArea className="h-[200px]">
                            {filteredDistricts.map((district) => (
                              <div
                                key={district.name}
                                onClick={() => {
                                  form.setValue("region", district.name);
                                  setOpen(false);
                                  setSearch('');
                                }}
                                className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent"
                              >
                                <Check
                                  className={cn(
                                    "absolute left-2 h-4 w-4",
                                    field.value === district.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {district.name}
                              </div>
                            ))}
                            {filteredDistricts.length === 0 && (
                               <div className="p-2 text-center text-sm text-muted-foreground">No district found.</div>
                            )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={!form.watch('region') || forecastState.status === 'loading'} className="w-full">
                {forecastState.status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Generate Forecast
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}

      {activeTab === 'result' && (
        <CardContent>
          {forecastState.status === 'loading' && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-semibold font-headline">Generating forecast...</p>
              <p className="text-sm text-muted-foreground">Fetching live flood data and analyzing results. This may take a moment.</p>
            </div>
          )}
          {forecastState.status === 'failed' && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-muted-foreground max-w-md">{forecastState.error}</p>
              <Button onClick={() => setActiveTab('form')}>Try Again</Button>
            </div>
          )}
          {forecastState.status === 'succeeded' && forecastState.data && (
            <div className="space-y-6 p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Forecast for</p>
                <h3 className="font-headline text-2xl font-bold">{forecastState.data.forecastRegion}</h3>
                <p className="text-xs text-muted-foreground">Generated: {new Date(forecastState.data.forecastTimeUTC).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Risk Classification</p>
                  <p className={`font-headline text-3xl font-bold ${riskLevelToColor[forecastState.data.riskClassification]}`}>{forecastState.data.riskClassification}</p>
                </div>
                 <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Flood Probability</p>
                  <p className="font-headline text-3xl font-bold">{(forecastState.data.floodProbability * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">CI: [{(forecastState.data.confidenceIntervalLower*100).toFixed(0)}%-{(forecastState.data.confidenceIntervalUpper*100).toFixed(0)}%]</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 font-headline">Justification</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">{forecastState.data.justification}</p>
              </div>
              <Button onClick={() => setActiveTab('form')} className="w-full" variant="outline">Generate Another Forecast</Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
