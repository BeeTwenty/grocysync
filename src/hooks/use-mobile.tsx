
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(true) // Default to true for server-side rendering

  React.useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Add listener for resize events
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    window.addEventListener("resize", handleResize)
    
    // Check for touch capability as well
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsMobile(true)
    }
    
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
