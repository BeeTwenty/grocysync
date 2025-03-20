
import { useEffect } from 'react';
import { toast } from 'sonner';

// Detect if the app is in standalone mode (installed as PWA)
const isInStandaloneMode = () => 
  (window.matchMedia('(display-mode: standalone)').matches) || 
  (window.navigator as any).standalone || 
  document.referrer.includes('android-app://');

export function RegisterPWA() {
  useEffect(() => {
    // Check if the app is already installed
    if (isInStandaloneMode()) {
      console.log('PWA is installed');
      return;
    }

    // Handle beforeinstallprompt event
    let deferredPrompt: any;
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      
      // Show install notification after a delay
      setTimeout(() => {
        if (deferredPrompt) {
          toast.info(
            'Install GrocySync as an app!', 
            {
              duration: 10000,
              action: {
                label: 'Install',
                onClick: () => {
                  // Show the install prompt
                  deferredPrompt.prompt();
                  
                  // Wait for the user to respond to the prompt
                  deferredPrompt.userChoice.then((choiceResult: {outcome: string}) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                      toast.success('Thank you for installing GrocySync!');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                    // Clear the saved prompt since it can't be used again
                    deferredPrompt = null;
                  });
                }
              }
            }
          );
        }
      }, 10000); // Show after 10 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null; // This component doesn't render anything
}

export default RegisterPWA;
