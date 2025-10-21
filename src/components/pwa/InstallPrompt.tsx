/**
 * InstallPrompt Component
 * Prompts users to install the app as a PWA
 * Customizes prompt based on logged-in user (mom vs kids)
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  userName?: string;
  dashboardType?: 'family' | 'personal' | 'play' | 'guided' | 'independent';
}

const InstallPrompt: React.FC<InstallPromptProps> = ({
  userName = 'My',
  dashboardType = 'family'
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds of use
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt || isInstalled) return null;

  const getPromptText = () => {
    switch (dashboardType) {
      case 'personal':
        return {
          title: 'Install Your Personal Dashboard',
          description: 'Quick access to your private space from your home screen. Works offline!'
        };
      case 'play':
        return {
          title: `Install ${userName}'s Dashboard`,
          description: 'Add your fun dashboard to your home screen like a real app!'
        };
      case 'guided':
        return {
          title: `Install ${userName}'s Dashboard`,
          description: 'Get your own dashboard app on your home screen!'
        };
      case 'independent':
        return {
          title: `Install ${userName}'s Dashboard`,
          description: 'Add to home screen for quick access anytime, anywhere'
        };
      default:
        return {
          title: 'Install AIM Family Hub',
          description: 'Install to home screen for quick access and offline use'
        };
    }
  };

  const { title, description } = getPromptText();

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt-card">
        <button className="dismiss-btn" onClick={handleDismiss} aria-label="Dismiss">
          <X size={20} />
        </button>

        <div className="install-prompt-content">
          <div className="install-icon">📱</div>
          <h3>{title}</h3>
          <p>{description}</p>

          <div className="install-actions">
            <button className="install-btn primary" onClick={handleInstallClick}>
              Install App
            </button>
            <button className="install-btn secondary" onClick={handleDismiss}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
