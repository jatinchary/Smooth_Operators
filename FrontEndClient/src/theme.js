import { createTheme } from '@mui/material/styles'

// Theme color configurations
const themeColors = {
  gold: {
    primary: '#E7E9BB',
    primaryDark: '#403B4A',
    gradient: 'linear-gradient(to right, #E7E9BB, #403B4A)',
  },
  blue: {
    primary: '#515ada',
    primaryDark: '#efd5ff',
    gradient: 'linear-gradient(90deg, #515ada 0%, #efd5ff 100%)',
  },
}

export const createAppTheme = (themeName = 'gold') => {
  const colors = themeColors[themeName] || themeColors.gold

  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        contrastText: '#1a1d25',
      },
      secondary: {
        main: colors.primary,
        dark: colors.primaryDark,
      },
      background: {
        default: themeName === 'blue' ? '#ffffff' : '#1a1d25',
        paper: themeName === 'blue' ? '#ffffff' : '#252932',
      },
      text: {
        primary: themeName === 'blue' ? '#1f2937' : '#e5e7eb',
        secondary: themeName === 'blue' ? '#6b7280' : '#9ca3af',
      },
      error: {
        main: '#ef4444', // Red for error icons
      },
      success: {
        main: '#22c55e', // Green for success icons
      },
      warning: {
        main: '#f97316', // Orange for warning icons
      },
      info: {
        main: colors.primary, // Brand color for info
      },
      divider: themeName === 'blue' ? '#e5e7eb' : '#3d4354',
    },
    typography: {
      fontFamily: "'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif",
      h1: {
        fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '1.625rem',
      },
      h2: {
        fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '1.375rem',
      },
      h3: {
        fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '1.25rem',
      },
      h4: {
        fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '1.125rem',
      },
      h5: {
        fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '1rem',
      },
      h6: {
        fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '0.9375rem',
      },
      button: {
        fontFamily: "'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 500,
        fontSize: '0.75rem',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'uppercase',
            padding: '8px 16px',
            fontWeight: 500,
            fontFamily: "'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif",
            letterSpacing: '0.05em',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          sizeLarge: {
            fontSize: '0.75rem',
            padding: '10px 20px',
          },
          sizeMedium: {
            fontSize: '0.75rem',
            padding: '8px 16px',
          },
          sizeSmall: {
            fontSize: '0.6875rem',
            padding: '6px 12px',
          },
          contained: {
            background: colors.gradient,
            color: themeName === 'blue' ? '#ffffff' : '#000000',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              background: colors.gradient,
              transform: 'scale(1.02)',
              boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&.Mui-disabled': {
              background: themeName === 'blue' ? '#f3f4f6 !important' : '#2d3240 !important',
              color: themeName === 'blue' ? '#9ca3af !important' : '#6b7280 !important',
              opacity: 1,
              boxShadow: 'none',
              cursor: 'not-allowed',
              border: themeName === 'blue' ? '1px solid #e5e7eb' : '1px solid #3d4354',
              '&:hover': {
                background: themeName === 'blue' ? '#f3f4f6 !important' : '#2d3240 !important',
                transform: 'none',
                boxShadow: 'none',
              },
            },
            '& .MuiButton-startIcon, & .MuiButton-endIcon': {
              color: themeName === 'blue' ? '#ffffff' : '#000000',
            },
            '& svg, & .lucide': {
              color: themeName === 'blue' ? '#ffffff' : '#000000',
              fill: themeName === 'blue' ? '#ffffff' : '#000000',
              stroke: themeName === 'blue' ? '#ffffff' : '#000000',
            },
            '&.Mui-disabled .MuiButton-startIcon, &.Mui-disabled .MuiButton-endIcon': {
              color: themeName === 'blue' ? '#9ca3af !important' : '#4a5568 !important',
            },
            '&.Mui-disabled svg, &.Mui-disabled .lucide': {
              color: themeName === 'blue' ? '#9ca3af !important' : '#4a5568 !important',
              fill: themeName === 'blue' ? '#9ca3af !important' : '#4a5568 !important',
              stroke: themeName === 'blue' ? '#9ca3af !important' : '#4a5568 !important',
            },
          },
          outlined: {
            borderColor: colors.primary,
            color: colors.primary,
            '&:hover': {
              borderColor: colors.primary,
              backgroundColor: `rgba(${themeName === 'gold' ? '231, 233, 187' : '81, 90, 218'}, 0.1)`,
            },
          },
          text: {
            color: colors.primary,
            '&:hover': {
              backgroundColor: `rgba(${themeName === 'gold' ? '231, 233, 187' : '81, 90, 218'}, 0.1)`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            backgroundColor: themeName === 'blue' ? '#ffffff' : '#1a1d25',
            '& fieldset': {
              borderColor: themeName === 'blue' ? '#e5e7eb' : '#3d4354',
                borderWidth: '1px',
              },
              '&:hover': {
                backgroundColor: themeName === 'blue' ? '#ffffff' : '#1a1d25',
              },
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused': {
                backgroundColor: themeName === 'blue' ? '#ffffff' : '#1a1d25',
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
                borderWidth: '1px',
              },
              '&.Mui-disabled': {
                cursor: 'not-allowed',
                '&:hover fieldset': {
                  borderColor: themeName === 'blue' ? '#e5e7eb' : '#3d4354',
                },
              },
            },
            '& .MuiInputLabel-root': {
              color: themeName === 'blue' ? '#6b7280' : '#9ca3af',
              '&.Mui-focused': {
                color: colors.primary,
              },
              '&.MuiInputLabel-shrink': {
                color: themeName === 'blue' ? '#6b7280' : '#9ca3af',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: colors.primary,
            },
            '& .MuiInputBase-input': {
              color: themeName === 'blue' ? '#1f2937' : '#e5e7eb',
              '&::placeholder': {
                color: themeName === 'blue' ? '#9ca3af' : '#9ca3af',
                opacity: 1,
              },
            },
            '& .MuiSelect-select': {
              color: themeName === 'blue' ? '#1f2937' : '#e5e7eb',
              '&:empty': {
                color: themeName === 'blue' ? '#9ca3af' : '#9ca3af',
              },
              '& span': {
                color: themeName === 'blue' ? '#9ca3af' : '#9ca3af',
                opacity: '1 !important',
                display: 'inline-block !important',
              },
              '&[value=""]': {
                color: themeName === 'blue' ? '#9ca3af' : '#9ca3af',
              },
            },
            '& .MuiSelect-select[aria-disabled="true"]': {
              color: themeName === 'blue' ? '#9ca3af' : '#6b7280',
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: themeName === 'blue' ? '#9ca3af' : '#3d4354',
            padding: '8px',
            '&.Mui-checked': {
              color: themeName === 'blue' ? colors.primary : colors.primary,
            },
            '&:hover': {
              backgroundColor: `rgba(${themeName === 'gold' ? '231, 233, 187' : '81, 90, 218'}, 0.08)`,
            },
            '&.Mui-disabled': {
              cursor: 'not-allowed',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            },
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            marginRight: 0,
            alignItems: 'center',
          },
          label: {
            display: 'flex',
            alignItems: 'center',
            color: themeName === 'blue' ? '#1f2937' : '#e5e7eb',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: 1,
            visibility: 'visible',
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: themeName === 'blue' ? '#9ca3af' : '#3d4354',
            '&.Mui-checked': {
              color: themeName === 'blue' ? colors.primary : colors.primary,
            },
            '&:hover': {
              backgroundColor: `rgba(${themeName === 'gold' ? '231, 233, 187' : '81, 90, 218'}, 0.08)`,
            },
            '&.Mui-disabled': {
              cursor: 'not-allowed',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: colors.primary,
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: colors.primary,
            },
            '& .MuiSwitch-switchBase.Mui-checked:hover': {
              backgroundColor: `rgba(${themeName === 'gold' ? '231, 233, 187' : '81, 90, 218'}, 0.08)`,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            backgroundColor: themeName === 'blue' ? '#ffffff' : '#1a1d25',
            color: themeName === 'blue' ? '#1f2937' : '#e5e7eb',
            '&.Mui-disabled': {
              cursor: 'not-allowed',
              backgroundColor: themeName === 'blue' ? '#f9fafb' : '#1a1d25',
            },
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: themeName === 'blue' ? colors.primary : colors.primary,
              },
            },
          },
          icon: {
            color: themeName === 'blue' ? '#6b7280' : '#9ca3af',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: themeName === 'blue' ? '#1f2937' : '#e5e7eb',
            backgroundColor: themeName === 'blue' ? '#ffffff' : 'transparent',
            '&:hover': {
              backgroundColor: themeName === 'blue' ? '#f3f4f6' : 'rgba(255, 255, 255, 0.08)',
            },
            '&[value=""]': {
              color: themeName === 'blue' ? '#9ca3af' : '#9ca3af',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            backgroundColor: colors.primary,
            color: '#000000',
            border: `1px solid ${colors.primary}`,
          },
          standardSuccess: {
            backgroundColor: colors.primary,
            color: '#000000',
            '& .MuiAlert-icon': {
              color: '#22c55e', // Green icon for success
            },
          },
          standardError: {
            backgroundColor: colors.primary,
            color: '#000000',
            '& .MuiAlert-icon': {
              color: '#ef4444', // Red icon for error
            },
          },
          standardWarning: {
            backgroundColor: colors.primary,
            color: '#000000',
            '& .MuiAlert-icon': {
              color: '#f97316', // Orange icon for warning
            },
          },
          standardInfo: {
            backgroundColor: '#f97316', // Orange background for info
            color: '#000000',
            border: '1px solid #f97316',
            '& .MuiAlert-icon': {
              color: '#000000', // Black icon for info
              '& svg': {
                color: '#000000',
                fill: '#000000',
              },
              '& path': {
                fill: '#000000',
              },
              '& circle': {
                fill: '#000000',
                stroke: '#000000',
              },
            },
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiAlert-root': {
              backgroundColor: colors.primary,
              color: '#000000',
              border: `1px solid ${colors.primary}`,
            },
          },
        },
      },
    },
  })
}

// Default export for backward compatibility
const theme = createAppTheme('gold')
export default theme
