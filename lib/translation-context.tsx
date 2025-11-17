"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
]

interface TranslationContextType {
  language: string
  setLanguage: (language: string) => void
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType>({
  language: "fr",
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("fr")

  useEffect(() => {
    // Get language from local storage
    const storedLanguage = localStorage.getItem("language")
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    // Set language in local storage
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string) => {
    // Simple translation function - replace with a more robust solution if needed
    // For now, just return the key
    return key
  }

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
  }

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export const useTranslation = () => useContext(TranslationContext)
