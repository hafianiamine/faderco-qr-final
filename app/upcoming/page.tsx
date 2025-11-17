"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Smartphone, Bell, Rocket, Brain, Zap, Globe, FileCheck } from "lucide-react"
import Link from "next/link"

export default function UpcomingFeaturesPage() {
  const upcomingFeatures = [
    {
      icon: Sparkles,
      title: "Intelligence Artificielle Avancée",
      description:
        "Analyse prédictive et recommandations automatisées basées sur l'IA pour optimiser vos stratégies publicitaires.",
      eta: "06/19/2025",
    },
    {
      icon: Smartphone,
      title: "Application Mobile",
      description: "Accédez à vos données et analyses en déplacement avec notre nouvelle application mobile dédiée.",
      eta: "07/15/2025",
    },
    {
      icon: Bell,
      title: "Alertes Personnalisées",
      description:
        "Configurez des alertes sur mesure pour être notifié des changements importants dans vos métriques clés.",
      eta: "08/01/2025",
    },
    {
      icon: Rocket,
      title: "Intégration Multi-Plateformes",
      description:
        "Connectez vos données publicitaires de différentes plateformes pour une analyse unifiée et complète.",
      eta: "09/10/2025",
    },
    {
      icon: Brain,
      title: "Analyse Sémantique",
      description: "Analyse du contenu et du ton des publicités pour comprendre les messages et stratégies utilisés.",
      eta: "10/05/2025",
    },
    {
      icon: Zap,
      title: "Traitement en Temps Réel",
      description: "Analyse instantanée des données même pour de très grands volumes de données publicitaires.",
      eta: "11/15/2025",
    },
    {
      icon: Globe,
      title: "Analyse Géographique",
      description: "Visualisez la distribution géographique des campagnes publicitaires et leur impact régional.",
      eta: "12/01/2025",
    },
    {
      icon: FileCheck,
      title: "Validation Automatique",
      description:
        "Détection automatique des anomalies et validation des données pour garantir la qualité des analyses.",
      eta: "01/15/2026",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-4">Fonctionnalités à Venir</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Découvrez les nouvelles fonctionnalités que nous développons pour améliorer votre expérience d'analyse
            publicitaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{feature.eta}</span>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-card p-8 rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4">Vous avez des suggestions?</h2>
          <p className="text-muted-foreground mb-6">
            Nous sommes toujours à l'écoute de vos besoins. Si vous avez des idées de fonctionnalités qui pourraient
            améliorer votre expérience, n'hésitez pas à nous en faire part.
          </p>
          <Button size="lg">Suggérer une fonctionnalité</Button>
        </div>
      </div>
    </div>
  )
}
