import { useEffect, useState } from 'react'

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true)
  const [curtainsVisible, setCurtainsVisible] = useState(false)
  const [curtainsAnimating, setCurtainsAnimating] = useState(false)

  useEffect(() => {
    /**
     * 1. Setup master "curtain" effect that reveals page content.
     * 2. Calculate and set the master delay value
     * Formula: duration + delay + (stagger * 2)
     * 
     * Based on DarkStar theme logic converted to React
     */
    
    // Define master "curtain" animation variables (in seconds)
    const masterCurtainDelay = 2.4
    const masterCurtainDuration = 0.4
    const masterCurtainStagger = 0.24
    
    // Calculate effects master delay
    // effectsMasterDelay = delay + duration + (stagger * 2)
    const effectsMasterDelay = masterCurtainDelay + masterCurtainDuration + (masterCurtainStagger * 2)
    
    // Calculate total time before removal (with buffer)
    const totalDuration = (effectsMasterDelay + 0.7) * 1000 // Convert to milliseconds
    
    // Step 1: Show curtains immediately
    const showCurtainsTimer = setTimeout(() => {
      setCurtainsVisible(true)
    }, 100)

    // Step 2: Start curtain slide-up animation
    // Trigger at: delay - 0.7 (same as DarkStar logic)
    const animateCurtainsTimer = setTimeout(() => {
      setCurtainsAnimating(true)
    }, (masterCurtainDelay - 0.7) * 1000)

    // Step 3: Remove preloader completely after full animation
    const removeTimer = setTimeout(() => {
      setIsVisible(false)
    }, totalDuration)

    return () => {
      clearTimeout(showCurtainsTimer)
      clearTimeout(animateCurtainsTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="sk__master-curtain">
      <div 
        className={`mcurtain mcurtain-left ${curtainsVisible ? 'mcurtain-visible' : ''} ${curtainsAnimating ? 'mcurtain-animate' : ''}`}
        style={{ 
          animationDelay: '0s',
          backgroundImage: `url('/src/assets/curtain-background-left.svg')`
        }}
      ></div>
      <div 
        className={`mcurtain mcurtain-center-custom ${curtainsVisible ? 'mcurtain-visible' : ''} ${curtainsAnimating ? 'mcurtain-animate' : ''}`}
        style={{ 
          animationDelay: '0.24s',
          left: '33.333%'
        }}
      >
        {/* Inline SVG for center curtain so fonts load properly */}
        <svg viewBox="0 0 1280 2228" style={{ width: '100%', height: '100%' }}>
          <rect fill="#0A0A0A" width="1280" height="2228"/>
          <g>
            {/* Dealership Deal Icon - Car with Checkmark and Handshake */}
            <g transform="translate(640, 880) scale(1.5)">
              {/* Checkmark Circle */}
              <circle cx="-80" cy="-30" r="22" stroke="#E7E9BB" strokeWidth="6" fill="none"/>
              <polyline points="-90,-30 -83,-20 -70,-40" stroke="#E7E9BB" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Car Front View */}
              <g stroke="#E7E9BB" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Car roof and body */}
                <path d="M-45,-30 L-35,-45 L35,-45 L45,-30 L55,-25 L55,15 L45,20 L40,30 L-40,30 L-45,20 L-55,15 L-55,-25 Z"/>
                {/* Windshield */}
                <path d="M-30,-30 L-22,-40 L22,-40 L30,-30"/>
                {/* Hood line */}
                <line x1="-45" y1="-30" x2="45" y2="-30"/>
                {/* Headlights */}
                <rect x="-50" y="-12" width="15" height="8" rx="2"/>
                <rect x="35" y="-12" width="15" height="8" rx="2"/>
                {/* Grille */}
                <rect x="-15" y="0" width="30" height="12" rx="2"/>
                {/* Wheels */}
                <circle cx="-42" cy="30" r="10"/>
                <circle cx="42" cy="30" r="10"/>
                <circle cx="-42" cy="30" r="5"/>
                <circle cx="42" cy="30" r="5"/>
              </g>
              
              {/* Handshake */}
              <g transform="translate(0, 70)" stroke="#E7E9BB" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Left sleeve (cuff) */}
                <rect x="-70" y="25" width="20" height="18" rx="2"/>
                
                {/* Right sleeve (cuff) */}
                <rect x="50" y="25" width="20" height="18" rx="2"/>
                
                {/* Left arm to hand */}
                <path d="M-50,30 L-30,20 L-15,10"/>
                
                {/* Right arm to hand */}
                <path d="M50,30 L30,20 L15,10"/>
                
                {/* Left hand palm */}
                <path d="M-15,10 L-12,5 L-5,3 L0,5"/>
                
                {/* Right hand palm */}
                <path d="M15,10 L12,5 L5,3 L0,5"/>
                
                {/* Clasped thumbs */}
                <path d="M-8,8 L-8,15"/>
                <path d="M8,8 L8,15"/>
                
                {/* Left hand fingers */}
                <path d="M-3,5 L2,10 L2,18"/>
                <path d="M-1,5 L4,11 L4,20"/>
                <path d="M1,5 L6,12 L6,22"/>
                
                {/* Right hand fingers (wrapped around) */}
                <path d="M3,5 L-2,10 L-2,18"/>
                <path d="M1,5 L-4,11 L-4,20"/>
                <path d="M-1,5 L-6,12 L-6,22"/>
              </g>
            </g>
            
            {/* DCA Text */}
            <text 
              x="640" 
              y="1150" 
              fill="#E7E9BB" 
              fontFamily="Staatliches" 
              fontSize="100" 
              fontWeight="700"
              letterSpacing="0.15em" 
              textAnchor="middle"
              style={{ textTransform: 'uppercase' }}
            >
              DCA
            </text>
          </g>
        </svg>
      </div>
      <div 
        className={`mcurtain mcurtain-right ${curtainsVisible ? 'mcurtain-visible' : ''} ${curtainsAnimating ? 'mcurtain-animate' : ''}`}
        style={{ 
          animationDelay: '0.48s',
          backgroundImage: `url('/src/assets/curtain-background-right.svg')`
        }}
      ></div>
    </div>
  )
}


