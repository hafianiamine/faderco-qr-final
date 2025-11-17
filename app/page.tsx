"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { PageLoader } from "@/components/ui/loader"
import {
  ArrowRight,
  BarChart2,
  PieChart,
  TrendingUp,
  LineChart,
  BarChart,
  Activity,
  Layers,
  Zap,
  Search,
  Download,
  Share2,
  Database,
  Terminal,
  Award,
  Tv,
  Clock,
  Filter,
  FileText,
  Users,
  BarChartHorizontal,
  Calendar,
  Gauge,
  Sparkles,
  Lightbulb,
  Workflow,
  Megaphone,
  Target,
  Presentation,
  Laptop,
  Sliders,
  Smartphone,
  Bell,
  Rocket,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LoginPopup } from "@/components/login-popup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "@/styles/glass-effect.css"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [activeChart, setActiveChart] = useState(0)
  const [decryptedText, setDecryptedText] = useState("")
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [showWelcomePopup, setShowWelcomePopup] = useState(true)
  const targetText = "Aperçu des performances de marque"

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Generate sample chart data
      const data = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: Math.floor(Math.random() * 100) + 20,
        comparison: Math.floor(Math.random() * 80) + 10,
      }))
      setChartData(data)
    }, 2000)

    // Animation for chart tabs
    const chartInterval = setInterval(() => {
      setActiveChart((prev) => (prev >= 2 ? 0 : prev + 1))
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(chartInterval)
    }
  }, [])

  // Decryption effect
  useEffect(() => {
    if (isLoading) return

    // Start decryption animation after page loads
    setTimeout(() => {
      setIsDecrypting(true)
      let iteration = 0
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?~`"

      const interval = setInterval(() => {
        setDecryptedText(
          targetText
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return targetText[index]
              }
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join(""),
        )

        if (iteration >= targetText.length) {
          clearInterval(interval)
          setIsDecrypting(false)
        }

        iteration += 1 / 3
      }, 30)

      return () => clearInterval(interval)
    }, 500)
  }, [isLoading])

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("fadercoVisited")
    if (!hasVisited) {
      // Show welcome popup
      setShowWelcomePopup(true)
      // Set visited flag
      localStorage.setItem("fadercoVisited", "true")
    }
  }, [])

  if (isLoading) {
    return <PageLoader />
  }

  // Define features array outside of JSX
  const features = [
    { icon: LineChart, title: "Analyse des tendances" },
    { icon: Search, title: "Filtrage avancé" },
    { icon: Layers, title: "Agrégation de données" },
    { icon: Activity, title: "Métriques de performance" },
    { icon: Download, title: "Options d'exportation" },
    { icon: Share2, title: "Outils de partage" },
    { icon: Zap, title: "Traitement rapide" },
    { icon: BarChart, title: "Rapports personnalisés" },
  ]

  // Define all features including hidden ones
  const allFeatures = [
    {
      category: "Analyse de Marque",
      features: [
        {
          icon: Award,
          title: "Insights de Performance",
          description: "Analyse détaillée des performances de chaque marque avec classements et métriques clés",
        },
        {
          icon: Target,
          title: "Analyse Concurrentielle",
          description: "Comparaison automatique avec les concurrents et positionnement sur le marché",
        },
        {
          icon: Lightbulb,
          title: "Stratégies Publicitaires",
          description: "Identification automatique des stratégies publicitaires utilisées par chaque marque",
        },
        {
          icon: BarChartHorizontal,
          title: "Parts de Marché",
          description: "Calcul des parts de marché et de voix pour chaque marque",
        },
      ],
    },
    {
      category: "Analyse Temporelle",
      features: [
        {
          icon: Clock,
          title: "Heatmap Horaire",
          description: "Visualisation des heures de diffusion les plus fréquentes par marque",
        },
        {
          icon: Calendar,
          title: "Tendances Mensuelles",
          description: "Analyse des tendances publicitaires sur plusieurs mois ou années",
        },
        {
          icon: Activity,
          title: "Détection de Pics",
          description: "Identification automatique des pics d'activité publicitaire",
        },
        {
          icon: Workflow,
          title: "Analyse de Séquence",
          description: "Détection des séquences et patterns dans les diffusions publicitaires",
        },
      ],
    },
    {
      category: "Analyse de Contenu",
      features: [
        {
          icon: Tv,
          title: "Analyse par Chaîne",
          description: "Répartition des publicités par chaîne de télévision et type de média",
        },
        {
          icon: Megaphone,
          title: "Analyse des Messages",
          description: "Analyse des accroches et messages publicitaires par marque",
        },
        {
          icon: Users,
          title: "Segmentation d'Audience",
          description: "Analyse des publicités par segment d'audience ciblé",
        },
        {
          icon: Presentation,
          title: "Analyse de Format",
          description: "Analyse des formats publicitaires utilisés par chaque marque",
        },
      ],
    },
    {
      category: "Analyse Financière",
      features: [
        {
          icon: Gauge,
          title: "Efficacité des Coûts",
          description: "Analyse du coût par seconde et retour sur investissement publicitaire",
        },
        {
          icon: TrendingUp,
          title: "Prévisions Budgétaires",
          description: "Prévisions des dépenses publicitaires basées sur les tendances historiques",
        },
        {
          icon: PieChart,
          title: "Répartition des Dépenses",
          description: "Analyse de la répartition des dépenses publicitaires par marque et média",
        },
        {
          icon: Sparkles,
          title: "Optimisation Budgétaire",
          description: "Recommandations pour optimiser l'allocation budgétaire publicitaire",
        },
      ],
    },
    {
      category: "Gestion des Données",
      features: [
        {
          icon: Database,
          title: "Import/Export CSV",
          description: "Importation et exportation faciles des données publicitaires",
        },
        {
          icon: Filter,
          title: "Filtrage Multi-critères",
          description: "Filtrage avancé par marque, chaîne, date, heure et plus encore",
        },
        {
          icon: FileText,
          title: "Historique des Imports",
          description: "Suivi complet de l'historique des importations de données",
        },
        {
          icon: Sliders,
          title: "Validation des Données",
          description: "Validation automatique des données importées pour garantir leur qualité",
        },
      ],
    },
    {
      category: "Fonctionnalités Avancées",
      features: [
        {
          icon: Laptop,
          title: "Interface Responsive",
          description: "Accès à toutes les fonctionnalités sur ordinateur, tablette et mobile",
        },
        {
          icon: Zap,
          title: "Traitement en Temps Réel",
          description: "Analyse instantanée des données même pour de grands volumes",
        },
        {
          icon: Layers,
          title: "Multi-niveaux d'Analyse",
          description: "Possibilité d'explorer les données à différents niveaux de granularité",
        },
        {
          icon: Share2,
          title: "Partage de Rapports",
          description: "Génération et partage de rapports personnalisés avec l'équipe",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Animated glass background elements */}
      <div className="glass-blob glass-blob-1"></div>
      <div className="glass-blob glass-blob-2"></div>
      <div className="glass-blob glass-blob-3"></div>
      <div className="glass-blob glass-blob-4"></div>
      <div className="glass-blur"></div>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion Employé</DialogTitle>
            <DialogDescription>Connectez-vous pour accéder au tableau de bord Faderco Track.</DialogDescription>
          </DialogHeader>
          <LoginPopup onClose={() => setLoginDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Welcome Popup */}
      <Dialog open={showWelcomePopup} onOpenChange={setShowWelcomePopup}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-purple-500/10 z-0"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

            {/* Content container */}
            <div className="relative z-10 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/90 text-white p-2.5 rounded-xl">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Faderco Tracker Beta 1.0</h2>
                    <p className="text-muted-foreground text-sm">Bienvenue dans l'avenir de l'analyse publicitaire</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowWelcomePopup(false)}>
                  <span className="sr-only">Fermer</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border/40 rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> Notre technologie
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Notre système utilise des algorithmes d'IA avancés pour analyser les données publicitaires et vous
                    fournir des insights précieux en temps réel.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-background rounded-full p-2 mt-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="italic text-sm font-medium">
                        "Analyse en cours... Prédiction confirmée : avec Faderco Tracker, vos concurrents seront comme
                        des smartphones sans batterie... complètement déconnectés du marché!"
                      </p>
                      <p className="text-xs text-right mt-1 text-muted-foreground">— FadercoAI Assistant</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
                  <h3 className="font-medium mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-400">
                    <Bell className="h-4 w-4" /> Phase de test
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300/80">
                    Nous entrons dans une phase de test de 15 à 30 jours. Votre feedback est précieux! N'hésitez pas à
                    signaler les erreurs et à recommander des améliorations pendant cette période.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowWelcomePopup(false)}>
                  Peut-être plus tard
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                  onClick={() => setShowWelcomePopup(false)}
                >
                  Commencer l'expérience
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Faderco Track</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition">Fonctionnalités</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Toutes les Fonctionnalités de Faderco Track</DialogTitle>
                <DialogDescription>
                  Découvrez l'ensemble des fonctionnalités puissantes qui font de Faderco Track la solution complète
                  pour l'analyse publicitaire.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="detailed">Vue détaillée</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                    <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Analyse de Marque</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Insights détaillés sur les performances des marques et analyse concurrentielle
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Analyse Temporelle</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visualisation des tendances et patterns temporels des diffusions publicitaires
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        <Tv className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Analyse de Contenu</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Analyse des chaînes, messages et formats publicitaires
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        <Gauge className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Analyse Financière</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Analyse des coûts, ROI et optimisation budgétaire
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Gestion des Données</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Import/export, filtrage et validation des données
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-3 bg-muted/30 rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full mb-2">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold">Fonctionnalités Avancées</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Interface responsive, traitement en temps réel et partage de rapports
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => {
                        const detailedTab = document.querySelector('[value="detailed"]')
                        if (detailedTab) {
                          ;(detailedTab as HTMLButtonElement).click()
                        }
                      }}
                    >
                      Voir toutes les fonctionnalités <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="mt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {allFeatures.map((category, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`}>
                        <AccordionTrigger className="text-lg font-medium">{category.category}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                            {category.features.map((feature, featureIdx) => {
                              const Icon = feature.icon
                              return (
                                <div key={featureIdx} className="flex items-start gap-3 p-3 rounded-lg border">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition">Avantages</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Avantages de Faderco Track</DialogTitle>
                <DialogDescription>
                  Découvrez comment notre plateforme peut transformer votre stratégie publicitaire.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Prise de décision optimisée</h4>
                    <p className="text-sm text-muted-foreground">
                      Obtenez des insights en temps réel pour ajuster vos campagnes publicitaires et maximiser votre
                      ROI.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Analyse comparative</h4>
                    <p className="text-sm text-muted-foreground">
                      Comparez directement vos performances avec celles de vos concurrents pour identifier les
                      opportunités.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Efficacité opérationnelle</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatisez la collecte et l&apos;analyse des données pour libérer du temps pour la stratégie.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition">
                Fonctionnalités à Venir
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Fonctionnalités à Venir</DialogTitle>
                <DialogDescription>
                  Découvrez les nouvelles fonctionnalités que nous développons pour améliorer votre expérience.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Intelligence Artificielle Avancée</h3>
                  <p className="text-muted-foreground">
                    Analyse prédictive et recommandations automatisées basées sur l'IA pour optimiser vos stratégies
                    publicitaires.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Application Mobile</h3>
                  <p className="text-muted-foreground">
                    Accédez à vos données et analyses en déplacement avec notre nouvelle application mobile dédiée.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Alertes Personnalisées</h3>
                  <p className="text-muted-foreground">
                    Configurez des alertes sur mesure pour être notifié des changements importants dans vos métriques
                    clés.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Intégration Multi-Plateformes</h3>
                  <p className="text-muted-foreground">
                    Connectez vos données publicitaires de différentes plateformes pour une analyse unifiée et complète.
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button asChild>
                  <a href="/upcoming">Voir toutes les fonctionnalités à venir</a>
                </Button>
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition">À propos</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>À propos de Faderco Track</DialogTitle>
                <DialogDescription>
                  Un outil développé par l&apos;équipe digitale pour surveiller les publicités de Faderco et celles des
                  concurrents grâce à l&apos;intelligence artificielle.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>
                  Faderco Track utilise des algorithmes d&apos;IA avancés pour analyser les données publicitaires
                  télévisées, permettant une surveillance en temps réel et des analyses comparatives détaillées.
                </p>
                <p>
                  Notre plateforme offre des insights précieux sur les stratégies marketing, les tendances du marché et
                  les opportunités d&apos;optimisation des campagnes publicitaires.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setLoginDialogOpen(true)}>
            Connexion
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-5xl md:text-6xl font-bold">
            <span className="block mb-2">Analyse des publicités TV</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Simplifiée
            </span>
          </div>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Plateforme d&apos;analyse complète pour suivre et optimiser vos campagnes publicitaires télévisées. Obtenez
            des insights précieux sur les performances de votre marque.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setLoginDialogOpen(true)}>
              Connexion Employé <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  Découvrir toutes les fonctionnalités
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Fonctionnalités Complètes de Faderco Track</DialogTitle>
                  <DialogDescription>
                    Explorez l'ensemble des fonctionnalités avancées disponibles dans notre plateforme.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {allFeatures.map((category, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`}>
                        <AccordionTrigger className="text-lg font-medium">{category.category}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                            {category.features.map((feature, featureIdx) => {
                              const Icon = feature.icon
                              return (
                                <div key={featureIdx} className="flex items-start gap-3 p-3 rounded-lg border">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="secondary" onClick={() => {}}>
                    Fermer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Interactive Chart Preview */}
      <section className="container mx-auto px-4 py-10 relative z-10">
        <div className="bg-card rounded-lg shadow-xl border border-border p-2 max-w-5xl mx-auto animate-fade-in hover:shadow-2xl transition-all duration-300">
          <div className="flex space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="bg-muted rounded-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary animate-pulse" />
                <h3 className={`text-xl font-bold font-mono ${isDecrypting ? "text-primary" : ""}`}>
                  {decryptedText || targetText}
                </h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveChart(0)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeChart === 0
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted-foreground/10 text-foreground hover:bg-muted-foreground/30"
                  }`}
                >
                  Barres
                </button>
                <button
                  onClick={() => setActiveChart(1)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeChart === 1
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted-foreground/10 text-foreground hover:bg-muted-foreground/30"
                  }`}
                >
                  Lignes
                </button>
                <button
                  onClick={() => setActiveChart(2)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeChart === 2
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted-foreground/10 text-foreground hover:bg-muted-foreground/30"
                  }`}
                >
                  Aires
                </button>
              </div>
            </div>

            {/* Bar Chart */}
            <div
              className={`h-64 w-full transition-all duration-500 ${
                activeChart === 0 ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <div className="relative h-full w-full">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-700/20 w-full h-0"></div>
                  ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full h-full flex">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col justify-end items-center group px-1">
                        <div className="relative w-full h-full flex flex-col justify-end">
                          {/* Your brand bar */}
                          <div
                            className="w-full bg-primary/80 rounded-t-sm transition-all duration-500 ease-out group-hover:bg-primary animate-grow-height"
                            style={{
                              height: `${item.value}%`,
                              animationDelay: `${index * 100}ms`,
                            }}
                          />

                          {/* Competitor bar (slightly offset) */}
                          <div
                            className="absolute bottom-0 left-2 right-0 bg-purple-500/70 rounded-t-sm transition-all duration-500 ease-out group-hover:bg-purple-500/90 animate-grow-height"
                            style={{
                              height: `${item.comparison}%`,
                              width: "70%",
                              animationDelay: `${index * 150}ms`,
                            }}
                          />
                        </div>
                        <div className="text-xs mt-2 text-muted-foreground">M{item.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div
              className={`h-64 w-full transition-all duration-500 ${
                activeChart === 1 ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <svg width="100%" height="100%" viewBox="0 0 1200 300" preserveAspectRatio="none">
                {/* Grid lines */}
                <g className="grid-lines">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={60 * i}
                      x2="1200"
                      y2={60 * i}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Line for brand data */}
                <path
                  d={`M ${chartData.map((d, i) => `${(i * 1200) / 11} ${300 - d.value * 2.5}`).join(" L ")}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  className="animate-draw-line"
                />

                {/* Line for comparison data */}
                <path
                  d={`M ${chartData.map((d, i) => `${(i * 1200) / 11} ${300 - d.comparison * 2.5}`).join(" L ")}`}
                  fill="none"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="3"
                  strokeOpacity="0.7"
                  className="animate-draw-line"
                  style={{ animationDelay: "0.5s" }}
                />

                {/* Data points for brand */}
                {chartData.map((d, i) => (
                  <circle
                    key={`brand-${i}`}
                    cx={(i * 1200) / 11}
                    cy={300 - d.value * 2.5}
                    r="4"
                    fill="hsl(var(--primary))"
                    className="animate-pop"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}

                {/* Data points for comparison */}
                {chartData.map((d, i) => (
                  <circle
                    key={`comp-${i}`}
                    cx={(i * 1200) / 11}
                    cy={300 - d.comparison * 2.5}
                    r="4"
                    fill="rgb(168, 85, 247)"
                    className="animate-pop"
                    style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                  />
                ))}
              </svg>
            </div>

            {/* Area Chart */}
            <div
              className={`h-64 w-full transition-all duration-500 ${
                activeChart === 2 ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <svg width="100%" height="100%" viewBox="0 0 1200 300" preserveAspectRatio="none">
                {/* Grid lines */}
                <g className="grid-lines">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={60 * i}
                      x2="1200"
                      y2={60 * i}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Area for brand data */}
                <path
                  d={`M 0 300 ${chartData
                    .map((d, i) => `L ${(i * 1200) / 11} ${300 - d.value * 2.5}`)
                    .join(" ")} L 1200 300 Z`}
                  fill="url(#brandGradient)"
                  className="animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
                />

                {/* Area for comparison data */}
                <path
                  d={`M 0 300 ${chartData
                    .map((d, i) => `L ${(i * 1200) / 11} ${300 - d.comparison * 2.5}`)
                    .join(" ")} L 1200 300 Z`}
                  fill="url(#comparisonGradient)"
                  className="animate-fade-in"
                  style={{ animationDelay: "0.6s" }}
                />

                {/* Gradients */}
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex justify-between mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-sm"></div>
                <span className="text-sm">Votre marque</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500/70 rounded-sm"></div>
                <span className="text-sm">Concurrents</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4">Fonctionnalités d&apos;analyse puissantes</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Notre plateforme offre un ensemble complet d&apos;outils d&apos;analyse pour vous aider à comprendre et
          optimiser vos campagnes publicitaires.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Analyse de Marque</h3>
            <p className="text-muted-foreground mb-4">
              Obtenez des insights détaillés sur les performances de chaque marque avec des métriques clés et une
              analyse concurrentielle.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Classement des marques</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Analyse concurrentielle</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Stratégies publicitaires</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Analyse Temporelle</h3>
            <p className="text-muted-foreground mb-4">
              Visualisez les tendances et patterns temporels des diffusions publicitaires pour optimiser vos plannings.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Heatmap horaire</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Tendances mensuelles</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Détection de pics</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Gauge className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Analyse Financière</h3>
            <p className="text-muted-foreground mb-4">
              Analysez l&apos;efficacité des coûts et optimisez votre budget publicitaire pour maximiser le ROI.
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Efficacité des coûts</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Répartition des dépenses</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Optimisation budgétaire</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                Découvrir toutes les fonctionnalités <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Fonctionnalités Complètes de Faderco Track</DialogTitle>
                <DialogDescription>
                  Explorez l'ensemble des fonctionnalités avancées disponibles dans notre plateforme.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {allFeatures.map((category, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-lg font-medium">{category.category}</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                          {category.features.map((feature, featureIdx) => {
                            const Icon = feature.icon
                            return (
                              <div key={featureIdx} className="flex items-start gap-3 p-3 rounded-lg border">
                                <div className="bg-primary/10 p-2 rounded-full">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{feature.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-8 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12">Tout ce dont vous avez besoin</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium">{feature.title}</h3>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-card rounded-lg border border-border p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Fonctionnalités Cachées et Avancées</h3>
          <p className="text-center text-muted-foreground mb-6">
            Découvrez les fonctionnalités avancées qui font de Faderco Track une solution complète pour l&apos;analyse
            publicitaire.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" /> Analyse Prédictive
              </h4>
              <p className="text-sm text-muted-foreground">
                Prédictions basées sur l&apos;IA pour anticiper les tendances publicitaires et optimiser vos campagnes
                futures.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" /> Segmentation Avancée
              </h4>
              <p className="text-sm text-muted-foreground">
                Segmentez vos données selon des critères personnalisés pour des analyses ultra-ciblées.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Workflow className="h-4 w-4 text-primary" /> Automatisation
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatisez l&apos;importation, l&apos;analyse et la génération de rapports pour gagner du temps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 border-t border-border relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Faderco Track</span>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Faderco Media Analytics. Tous droits réservés
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
