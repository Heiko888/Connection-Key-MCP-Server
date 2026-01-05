'use client'

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#F29F05' }, // Akzent 1
    secondary: { main: '#8C1D04' }, // Akzent 2
    background: { 
      default: '#0b0a0f',
      paper: 'rgba(255,255,255,0.06)'
    },
    text: { 
      primary: '#ffffff', 
      secondary: 'rgba(255,255,255,0.8)'
    },
    error: { main: '#8C1D04' },
    warning: { main: '#F29F05' },
    success: { main: '#590A03' },
    info: { main: '#260A0A' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['Inter','system-ui','Segoe UI','Roboto','Arial'].join(','),
    h1: { 
      fontWeight: 900, 
      fontSize: '3.5rem',
      color: '#ffffff',
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: { 
      fontWeight: 800, 
      fontSize: '2.8rem',
      color: '#ffffff',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h3: {
      fontWeight: 800,
      fontSize: '1.5rem',
      color: '#ffffff'
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.25rem',
      color: '#ffffff'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.4rem',
      color: 'rgba(255, 255, 255, 0.9)',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
      '@media (min-width:600px) and (max-width:960px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontWeight: 400,
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.8)',
      '@media (max-width:600px)': {
        fontSize: '0.95rem',
      },
    },
    button: { 
      textTransform: 'none', 
      fontWeight: 600 
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(1200px 600px at 50% 10%, rgba(242,159,5,0.08), transparent), linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)',
          position: 'relative',
          // Browser-spezifische Eigenschaften entfernt, um Warnungen zu reduzieren
          '&::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(90% 70% at 50% 28%, rgba(242, 159, 5, 0.24), transparent 78%), radial-gradient(60% 50% at 82% 82%, rgba(140, 29, 4, 0.18), transparent 78%)',
            zIndex: -1
          }
        },
        // Reduziere Browser-Präfix-Warnungen
        '*': {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(242, 159, 5, 0.15)',
          backdropFilter: 'blur(10px)'
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { 
          borderRadius: 12, 
          paddingInline: 16, 
          paddingBlock: 10,
          fontWeight: 600
        },
        contained: {
          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 35px rgba(242, 159, 5, 0.35)'
          }
        },
        outlined: {
          borderColor: '#F29F05',
          color: '#F29F05',
          '&:hover': {
            borderColor: '#8C1D04',
            backgroundColor: 'rgba(242, 159, 5, 0.10)'
          }
        },
        text: {
          color: '#F29F05',
          '&:hover': {
            backgroundColor: 'rgba(242, 159, 5, 0.08)'
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          backgroundColor: 'transparent',
          background: 'rgba(242, 159, 5, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(242, 159, 5, 0.15)',
          borderRadius: 12,
          transition: 'all 0.3s ease',
          color: '#F29F05',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(242, 159, 5, 0.25)'
          }
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { 
          backgroundColor: 'rgba(242, 159, 5, 0.1)',
          borderRadius: 8
        },
        notchedOutline: { 
          borderColor: 'rgba(242, 159, 5, 0.4)',
          '&:hover': {
            borderColor: 'rgba(242, 159, 5, 0.6)'
          }
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: 'rgba(242, 159, 5, 0.1)',
            borderRadius: 8
          }
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(242, 159, 5, 0.1)',
          borderRadius: 8,
          color: 'white',
          '&::placeholder': {
            color: 'rgba(255,255,255,0.7)'
          }
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#F29F05'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(242, 159, 5, 0.2)',
          color: '#F29F05',
          border: '1px solid #F29F05',
          '&:hover': {
            backgroundColor: 'rgba(242, 159, 5, 0.3)'
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(242, 159, 5, 0.25)',
          backdropFilter: 'blur(8px)'
        },
        standardInfo: {
          backgroundColor: 'rgba(38,10,10,0.25)',
          color: '#ffffff'
        },
        standardSuccess: {
          backgroundColor: 'rgba(89,10,3,0.25)',
          color: '#ffffff'
        },
        standardWarning: {
          backgroundColor: 'rgba(242,159,5,0.18)',
          color: '#ffffff'
        },
        standardError: {
          backgroundColor: 'rgba(140,29,4,0.22)',
          color: '#ffffff'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(242, 159, 5, 0.25)',
          backdropFilter: 'blur(8px)'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(242, 159, 5, 0.25)'
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderTop: '1px solid rgba(242, 159, 5, 0.25)'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#ffffff'
        }
      }
    }
  },
})

export default theme
