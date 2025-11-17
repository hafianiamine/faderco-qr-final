"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Award, TrendingUp, Tv } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface BrandDetailsDialogProps {
  open: boolean
  onClose: () => void
  brand: {
    name: string
    appearances: number
    totalDuration: number
    totalSpend: number
    appearanceRank: number
    durationRank: number
    spendRank: number
    appearancePercentile: number
    durationPercentile: number
    spendPercentile: number
    channels: string[]
    campaignDays: number
    adsPerDay: number
    avgDuration: number
    costPerSecond: number
    costEfficiency: string
    strategy: string
    competitors: string[]
    marketShare: number
    shareOfVoice: number
    comparedToLeader: {
      appearances: number
      duration: number
    }
    keyDifferentiators: string[]
  }
}

export function BrandDetailsDialog({ open, onClose, brand }: BrandDetailsDialogProps) {
  if (!brand) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-xl">Meilleure marque: {brand.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Cette marque apparaît le plus fréquemment dans les données avec {brand.appearances} apparitions.
            </p>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Aperçu de la marque</TabsTrigger>
            <TabsTrigger value="charts">Graphiques & Données</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 py-4 max-h-[calc(90vh-180px)] overflow-y-auto">
            {/* Brand Performance Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Brand Performance Summary</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-sm">
                    #{brand.appearanceRank} by Appearances
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    #{brand.durationRank} by Duration
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    #{brand.spendRank} by Spend
                  </Badge>
                </div>

                <p className="text-sm mb-4">
                  <span className="font-medium">{brand.name}</span> appears{" "}
                  <span className="font-medium">{brand.appearances} times</span> in the dataset, with a total duration
                  of <span className="font-medium">{brand.totalDuration} seconds</span> and a total spend of{" "}
                  <span className="font-medium">{brand.totalSpend.toLocaleString()}</span>.
                </p>

                <p className="text-sm mb-4">
                  This brand ranks in the top {brand.appearancePercentile}% for appearances, top{" "}
                  {brand.durationPercentile}% for duration, and top {brand.spendPercentile}% for advertising spend.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Channels Used</p>
                    <p className="text-lg font-medium">{brand.channels.length}</p>
                    <p className="text-xs text-muted-foreground">Including {brand.channels.slice(0, 2).join(", ")}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Campaign Duration</p>
                    <p className="text-lg font-medium">{brand.campaignDays} days</p>
                    <p className="text-xs text-muted-foreground">{brand.adsPerDay} ads per day (avg)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertising Strategy Analysis */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Advertising Strategy Analysis</h3>
                </div>

                <div className="rounded-lg bg-muted p-4 mb-4">
                  <h4 className="font-medium mb-2">Strategy Insight</h4>
                  <p className="text-sm">{brand.strategy}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-1">Average Ad Duration</h4>
                    <p className="text-lg font-semibold">{brand.avgDuration} seconds</p>
                    <p className="text-xs text-muted-foreground">Shorter than average</p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-1">Cost Efficiency</h4>
                    <p className="text-lg font-semibold">{brand.costPerSecond.toLocaleString()} per second</p>
                    <p className="text-xs text-muted-foreground">{brand.costEfficiency}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="font-medium">Key Differentiators</h4>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {brand.keyDifferentiators.map((differentiator, index) => (
                      <li key={index}>{differentiator}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Competitive Analysis */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Competitive Analysis</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-sm">
                    <span className="font-medium">{brand.name}</span>'s main competitors include{" "}
                    <span className="font-medium">{brand.competitors.join(", ")}</span>.
                  </p>

                  <div className="rounded-lg bg-muted p-4 mt-2">
                    <h4 className="font-medium mb-2">Competitive Positioning</h4>
                    <p className="text-sm">
                      Compared to {brand.name} (the most frequent brand), {brand.name} has{" "}
                      <span className="font-medium">{brand.comparedToLeader.appearances}%</span> of the appearances and{" "}
                      <span className="font-medium">{brand.comparedToLeader.duration}%</span> of the airtime compared to
                      the duration leader.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Market Share (by Appearances)</p>
                      <p className="text-lg font-medium">{brand.marketShare}%</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Share of Voice (by Duration)</p>
                      <p className="text-lg font-medium">{brand.shareOfVoice}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="py-4 text-center text-muted-foreground">
              Graphiques détaillés pour {brand.name} seront affichés ici.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
