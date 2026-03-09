import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ALERTS } from "@/data/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Circle } from "lucide-react";

export const metadata = {
  title: "Monitoring | Crypto AI Market Intelligence",
  description: "Alerts and monitoring rules.",
};

export default function MonitoringPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitoring</h1>
        <p className="mt-1 text-muted-foreground">
          Alerts and rules for price, volume, and narrative changes
        </p>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="alerts">Alert rules</TabsTrigger>
          <TabsTrigger value="activity">Recent activity</TabsTrigger>
        </TabsList>
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_ALERTS.map((alert) => (
              <Card key={alert.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {alert.name}
                  </CardTitle>
                  {alert.active ? (
                    <Badge variant="default" className="bg-emerald-600/80">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Paused</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {alert.type === "price" && (
                      <>
                        <span>Price</span>
                        <span>{alert.condition}</span>
                        <span className="font-medium text-foreground">
                          {typeof alert.value === "number" &&
                          alert.value >= 1000
                            ? `$${alert.value.toLocaleString()}`
                            : alert.value}
                        </span>
                      </>
                    )}
                    {alert.type === "volume" && (
                      <>
                        <span>Volume</span>
                        <span>{alert.condition}</span>
                        <span className="font-medium text-foreground">
                          {alert.value}x avg
                        </span>
                      </>
                    )}
                    {alert.type === "narrative" && (
                      <>
                        <span>Narrative sentiment</span>
                        <span>{alert.condition}</span>
                        <span className="font-medium text-foreground">
                          {alert.value}%
                        </span>
                      </>
                    )}
                  </div>
                  {alert.lastTriggered && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Bell className="h-3.5 w-3.5" />
                      Last triggered: {alert.lastTriggered}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">ETH volume spike</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">
                      AI narrative sentiment &gt; 80
                    </p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">No other recent triggers</p>
                    <p className="text-xs text-muted-foreground">
                      Alerts are running normally
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
