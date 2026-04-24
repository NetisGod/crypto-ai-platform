import { MOCK_ALERTS } from "@/data/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle2, Circle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlowCard } from "@/components/ui/glow-card";
import { StatPill } from "@/components/ui/stat-pill";

export const metadata = {
  title: "Monitoring | Crypto AI Market Intelligence",
  description: "Alerts and monitoring rules.",
};

export default function MonitoringPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Ops"
        title="Monitoring & alerts."
        description="Price, volume, and narrative triggers — always watching the market so you don't have to."
      />

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="inline-flex h-auto items-center gap-0.5 rounded-full border border-border/60 bg-card/60 p-1 backdrop-blur">
          <TabsTrigger
            value="alerts"
            className="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
          >
            Alert rules
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
          >
            Recent activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_ALERTS.map((alert) => (
              <GlowCard key={alert.id} padding="md">
                <div className="flex flex-row items-center justify-between pb-3">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {alert.name}
                  </h3>
                  {alert.active ? (
                    <StatPill tone="success" dot pulse>
                      Active
                    </StatPill>
                  ) : (
                    <StatPill tone="neutral" dot>
                      Paused
                    </StatPill>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {alert.type === "price" && (
                      <>
                        <span className="uppercase tracking-[0.14em] text-[10px] font-semibold text-accent">
                          Price
                        </span>
                        <span>{alert.condition}</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {typeof alert.value === "number" && alert.value >= 1000
                            ? `$${alert.value.toLocaleString()}`
                            : alert.value}
                        </span>
                      </>
                    )}
                    {alert.type === "volume" && (
                      <>
                        <span className="uppercase tracking-[0.14em] text-[10px] font-semibold text-accent">
                          Volume
                        </span>
                        <span>{alert.condition}</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {alert.value}x avg
                        </span>
                      </>
                    )}
                    {alert.type === "narrative" && (
                      <>
                        <span className="uppercase tracking-[0.14em] text-[10px] font-semibold text-accent">
                          Narrative sentiment
                        </span>
                        <span>{alert.condition}</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {alert.value}%
                        </span>
                      </>
                    )}
                  </div>
                  {alert.lastTriggered && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Bell className="h-3.5 w-3.5" />
                      Last triggered: {alert.lastTriggered}
                    </p>
                  )}
                </div>
              </GlowCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <GlowCard padding="md" noHoverBlob>
            <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
              Recent triggers
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 border-b border-border/60 pb-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    ETH volume spike
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </li>
              <li className="flex items-start gap-3 border-b border-border/60 pb-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    AI narrative sentiment &gt; 80
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    No other recent triggers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Alerts are running normally
                  </p>
                </div>
              </li>
            </ul>
          </GlowCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
