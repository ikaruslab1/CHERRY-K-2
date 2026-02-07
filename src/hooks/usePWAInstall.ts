import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Detect standalone mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');
      
    setIsStandalone(isStandaloneMode);

    // If already standalone, no need to install
    if (isStandaloneMode) {
      setIsInstallable(false);
      return;
    }

    // Handle beforeinstallprompt (Android / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log('PWA installation prompt intercepted');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      console.log('PWA installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, if not standalone, it's technically "installable" via manual instructions
    if (ios && !isStandaloneMode) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptToInstall = async () => {
    if (!deferredPrompt && !isIOS) {
      console.log('No installation prompt available');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
    // For iOS, the UI should handle opening the instructions modal
  };

  return { isInstallable, isIOS, isStandalone, promptToInstall };
}
