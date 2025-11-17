import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'

export default function CustomCursor() {
  const muiTheme = useTheme()
  const currentTheme = useSelector((state) => state.config.theme || 'gold')
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
      
      // Check if hovering over interactive elements
      const target = e.target
      const isInteractive = target.matches('button, a, .btn, [role="button"], .MuiButton-root, .MuiFormControlLabel-root, input[type="button"], input[type="submit"], select, .MuiRadio-root, .MuiCheckbox-root') &&
        !target.matches(':disabled, .Mui-disabled')
      
      setIsHovering(isInteractive)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      {/* Outer ring */}
      <div
        className="custom-cursor-outer"
        style={{
          position: 'fixed',
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: isHovering ? '40px' : '30px',
          height: isHovering ? '40px' : '30px',
          borderRadius: '50%',
          border: `2px solid ${muiTheme.palette.primary.main}`,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          transition: 'width 0.2s ease-out, height 0.2s ease-out, opacity 0.2s ease-out',
          opacity: isHovering ? 0.4 : 0.2,
          mixBlendMode: 'normal',
        }}
      />
      {/* Inner dot */}
      <div
        className="custom-cursor-inner"
        style={{
          position: 'fixed',
          left: cursorPosition.x,
          top: cursorPosition.y,
          width: isHovering ? '8px' : '6px',
          height: isHovering ? '8px' : '6px',
          borderRadius: '50%',
          backgroundColor: muiTheme.palette.primary.main,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          transition: 'width 0.15s ease-out, height 0.15s ease-out',
        }}
      />
    </>
  )
}

