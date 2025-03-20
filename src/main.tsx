
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './hooks/use-theme.tsx'
import { Toaster } from 'sonner'
import { AuthProvider } from './hooks/useAuth.tsx'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="grocysync-theme">
    <AuthProvider>
      <App />
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </ThemeProvider>
);
