import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Droplets, Thermometer, CloudRain, Satellite } from "lucide-react"

export function DataSummary() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Live Data Summary (ZMD & WARMA)
        </CardTitle>
        <Satellite className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex items-center">
            <CloudRain className="h-6 w-6 text-muted-foreground mr-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Avg. Rainfall</p>
              <p className="text-2xl font-bold font-headline">25.6 mm</p>
              <p className="text-xs text-muted-foreground">
                +15% from last 24h
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Droplets className="h-6 w-6 text-muted-foreground mr-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Kafue River Level</p>
              <p className="text-2xl font-bold font-headline">4.2 m</p>
              <p className="text-xs text-muted-foreground">
                +2.1% from last hour
              </p>
            </div>
          </div>
           <div className="flex items-center">
            <Thermometer className="h-6 w-6 text-muted-foreground mr-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">Soil Moisture</p>
              <p className="text-2xl font-bold font-headline">82%</p>
              <p className="text-xs text-muted-foreground">
                Reaching saturation point
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
