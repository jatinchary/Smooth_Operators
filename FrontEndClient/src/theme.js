import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E7E9BB',
      dark: '#403B4A',
      contrastText: '#1a1d25',
    },
    secondary: {
      main: '#06b6d4',
      dark: '#0891b2',
    },
    background: {
      default: '#1a1d25',
      paper: '#252932',
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#9ca3af',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
    divider: '#3d4354',
  },
  typography: {
    fontFamily: "'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h3: {
      fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h4: {
      fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h5: {
      fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h6: {
      fontFamily: "'Staatliches', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    button: {
      fontFamily: "'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif",
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontWeight: 500,
      fontSize: '0.875rem',
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
          padding: '10px 20px',
          fontWeight: 500,
          fontFamily: "'Urbanist', ui-sans-serif, system-ui, -apple-system, sans-serif",
          letterSpacing: '0.05em',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          fontSize: '0.875rem',
          padding: '12px 24px',
        },
        sizeMedium: {
          fontSize: '0.8125rem',
          padding: '10px 20px',
        },
        sizeSmall: {
          fontSize: '0.75rem',
          padding: '8px 16px',
        },
        contained: {
          background: 'linear-gradient(to right, #E7E9BB, #403B4A)',
          color: '#000000',
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            background: 'linear-gradient(to right, #E7E9BB, #403B4A)',
            transform: 'scale(1.02)',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&.Mui-disabled': {
            background: '#2d3240 !important',
            color: '#6b7280 !important',
            opacity: 1,
            boxShadow: 'none',
            cursor: 'not-allowed',
            border: '1px solid #3d4354',
          },
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            color: '#000000',
          },
          '&.Mui-disabled .MuiButton-startIcon, &.Mui-disabled .MuiButton-endIcon': {
            color: '#4a5568 !important',
          },
        },
        outlined: {
          borderColor: '#E7E9BB',
          color: '#E7E9BB',
          '&:hover': {
            borderColor: '#E7E9BB',
            backgroundColor: 'rgba(231, 233, 187, 0.1)',
          },
        },
        text: {
          color: '#E7E9BB',
          '&:hover': {
            backgroundColor: 'rgba(231, 233, 187, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#1a1d25',
            '& fieldset': {
              borderColor: '#3d4354',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#E7E9BB',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E7E9BB',
              borderWidth: '1px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#E7E9BB',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#3d4354',
          padding: '8px',
          '&.Mui-checked': {
            color: '#E7E9BB',
          },
          '&:hover': {
            backgroundColor: 'rgba(231, 233, 187, 0.08)',
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
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#3d4354',
          '&.Mui-checked': {
            color: '#E7E9BB',
          },
          '&:hover': {
            backgroundColor: 'rgba(231, 233, 187, 0.08)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#1a1d25',
          '&.Mui-disabled': {
            cursor: 'not-allowed',
          },
        },
        icon: {
          color: '#9ca3af',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&[value=""]': {
            color: '#9ca3af',
          },
        },
      },
    },
  },
})

export default theme

