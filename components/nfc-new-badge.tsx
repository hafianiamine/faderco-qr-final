'use client'

import { useEffect, useState } from 'react'
import { Wifi, Zap, X } from 'lucide-react'
import { isConnectedToWiFi, onConnectionChange } from '@/lib/utils/wifi-detector'

export function NFCNewBadge() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isWiFiConnected, setIsWiFiConnected] = useState(false)
  const [hasShownOnce, setHasShownOnce] = useState(false)

  useEffect(() => {
    // Check if badge was dismissed in this session
    const dismissed = sessionStorage.getItem('nfc-badge-dismissed');
    if (dismissed) {
      return;
    }

    // Check initial WiFi connection
    const wifiConnected = isConnectedToWiFi();
    setIsWiFiConnected(wifiConnected);

    if (wifiConnected && !hasShownOnce) {
      console.log('[v0] NFCNewBadge: WiFi detected, showing badge');
      setIsVisible(true);
      setHasShownOnce(true);

      // Auto-hide after 5 seconds if not interacted
      const timer = setTimeout(() => {
        if (!isExpanded) {
          setIsVisible(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }

    // Monitor WiFi changes
    const unsubscribe = onConnectionChange((connected) => {
      setIsWiFiConnected(connected);
      if (connected && !hasShownOnce) {
        console.log('[v0] NFCNewBadge: WiFi connected, showing badge');
        setIsVisible(true);
        setHasShownOnce(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasShownOnce, isExpanded]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('nfc-badge-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Collapsed Badge */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
          aria-label="NFC New Card Badge"
        >
          <Zap className="w-4 h-4" />
          NEW
        </button>
      )}

      {/* Expanded Card */}
      {isExpanded && (
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 overflow-hidden animate-in fade-in duration-200 w-80">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">NFC Cards Ready</h3>
                <p className="text-blue-100 text-sm">Connected to WiFi</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded transition-colors"
              aria-label="Close NFC Badge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Wifi className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">WiFi Connected</p>
                <p className="text-gray-600 text-xs">Your NFC cards are synced and ready to share</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-gray-700">
                ✨ <span className="font-semibold">Tip:</span> Tap your NFC card icon to quickly access and share your virtual business card.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors text-sm"
              >
                Minimize
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
