import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertTriangle, Bell, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const alerts = [
  {
    level: "High",
    district: "Mongu",
    message: "Flood risk exceeds 75% probability threshold.",
    time: "2 minutes ago",
    confidence: "82%",
  },
  {
    level: "Moderate",
    district: "Lusaka",
    message: "River levels rising faster than expected.",
    time: "1 hour ago",
    confidence: "65%",
  },
  {
    level: "No Flood",
    district: "Chipata",
    message: "Conditions stable, risk downgraded.",
    time: "3 hours ago",
    confidence: "95%",
  },
];

const alertIcons = {
  "High": <AlertTriangle className="h-5 w-5 text-red-500" />,
  "Moderate": <Bell className="h-5 w-5 text-yellow-500" />,
  "No Flood": <ShieldCheck className="h-5 w-5 text-green-500" />,
};

const alertBadges = {
    "High": <Badge variant="destructive">High</Badge>,
    "Moderate": <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>,
    "No Flood": <Badge variant="secondary" className="bg-green-100 text-green-800">No Flood</Badge>,
}


export function AlertsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl font-semibold">Alerts</CardTitle>
        <CardDescription>
          Real-time notifications based on risk thresholds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="mt-1">
              {alertIcons[alert.level as keyof typeof alertIcons]}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                 <p className="font-semibold">{alert.district}</p>
                 {alertBadges[alert.level as keyof typeof alertBadges]}
              </div>
              <p className="text-sm text-muted-foreground">
                {alert.message}
              </p>
               <p className="text-xs text-muted-foreground mt-1">
                {alert.time} &bull; {alert.confidence} confidence
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
