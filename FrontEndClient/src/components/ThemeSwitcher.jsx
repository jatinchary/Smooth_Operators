import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setTheme } from '../store/slices/configSlice'
import { Palette } from 'lucide-react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

export default function ThemeSwitcher() {
  const dispatch = useDispatch()
  const muiTheme = useTheme()
  const currentTheme = useSelector((state) => state.config.theme || 'gold')
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleThemeChange = (event) => {
    const newTheme = event.target.value
    dispatch(setTheme(newTheme))
    // Close popover after selection
    setTimeout(() => {
      setAnchorEl(null)
    }, 200)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'theme-popover' : undefined

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        className="theme-switcher-btn"
        sx={{
          position: 'fixed',
          right: 16,
          top: 16,
          zIndex: 1000,
          minWidth: 'auto',
          padding: '10px 12px',
          borderRadius: '8px',
          borderColor: muiTheme.palette.primary.main,
          color: muiTheme.palette.primary.main,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: muiTheme.palette.primary.main,
            backgroundColor: `${muiTheme.palette.primary.main}15`,
            transform: 'scale(1.05)',
            boxShadow: `0 4px 12px ${muiTheme.palette.primary.main}40`,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
        aria-describedby={id}
      >
        <Palette size={20} style={{ color: muiTheme.palette.primary.main }} />
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: '12px',
            padding: '20px',
            minWidth: '240px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        TransitionProps={{
          timeout: 200,
        }}
      >
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase mb-4" style={{ color: muiTheme.palette.text.primary, letterSpacing: '0.1em' }}>
            Choose Theme
          </h3>
          <RadioGroup
            value={currentTheme}
            onChange={handleThemeChange}
            sx={{
              '& .MuiFormControlLabel-root': {
                marginLeft: 0,
                marginRight: 0,
                marginBottom: '12px',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                  backgroundColor: `${muiTheme.palette.primary.main}08`,
                  transform: 'translateX(4px)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '60%',
                    backgroundColor: muiTheme.palette.primary.main,
                    borderRadius: '0 4px 4px 0',
                    opacity: 0.6,
                  },
                },
                '&:last-child': {
                  marginBottom: 0,
                },
              },
            }}
          >
            <FormControlLabel
              value="gold"
              control={<Radio />}
              label={
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-r from-[#E7E9BB] to-[#403B4A] shadow-sm border border-opacity-20" style={{ borderColor: muiTheme.palette.divider }}></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: muiTheme.palette.text.primary }}>Gold Theme</span>
                    <span className="text-xs" style={{ color: muiTheme.palette.text.secondary }}>Warm & Elegant</span>
                  </div>
                </div>
              }
            />
            <FormControlLabel
              value="blue"
              control={<Radio />}
              label={
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-r from-[#515ada] to-[#efd5ff] shadow-sm border border-opacity-20" style={{ borderColor: muiTheme.palette.divider }}></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: muiTheme.palette.text.primary }}>Blue Theme</span>
                    <span className="text-xs" style={{ color: muiTheme.palette.text.secondary }}>Fresh & Modern</span>
                  </div>
                </div>
              }
            />
          </RadioGroup>
        </div>
      </Popover>
    </>
  )
}

