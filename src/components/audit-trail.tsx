import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Database, WandSparkles } from "lucide-react"

const trail = [
  {
    icon: <WandSparkles className="h-4 w-4 text-blue-500" />,
    action: "Forecast generated for Mongu.",
    time: "2m ago",
  },
  {
    icon: <Database className="h-4 w-4 text-green-500" />,
    action: "Ingested new data from ZMD.",
    time: "15m ago",
  },
    {
    icon: <Database className="h-4 w-4 text-green-500" />,
    action: "Ingested satellite data chunk #A42F.",
    time: "17m ago",
  },
  {
    icon: <WandSparkles className="h-4 w-4 text-purple-500" />,
    action: "Model v2.3.1 auto-retrained.",
    time: "5h ago",
  },
  {
    icon: <Database className="h-4 w-4 text-green-500" />,
    action: "Ingested new data from WARMA.",
    time: "6h ago",
  },
]

export function AuditTrail() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl font-semibold">Audit Trail</CardTitle>
        <CardDescription>
          Data provenance and model activity log.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[150px]">
          <div className="space-y-4">
            {trail.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.icon}
                <p className="text-sm font-medium flex-1">{item.action}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
