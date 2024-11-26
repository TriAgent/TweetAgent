import { red } from "@mui/material/colors";
import { alpha, createTheme } from "@mui/material/styles";
import type { } from '@mui/x-data-grid/themeAugmentation';

import {
  BACKGROUND_LIGHT_GRAY,
  BACKGROUND_PRIMARY_COLOR, BACKGROUND_SECONDARY_COLOR, MAIN_FONT_FAMILY,
  TEXT_PRIMARY_COLOR,
  TEXT_SECONDARY_COLOR
} from "./constants";

// // Augment the palette to include a violet color
declare module "@mui/material/styles" {
  interface Palette {
    violet: Palette["primary"];
  }

  interface PaletteOptions {
    violet?: PaletteOptions["primary"];
  }
}

// A custom theme for this app
const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: MAIN_FONT_FAMILY,
      textTransform: "none",
      fontSize: 16,
      color: TEXT_PRIMARY_COLOR
    },
  },
  palette: {
    violet: {
      main: "#131732",
      light: "#080c27",
    },
    primary: {
      main: TEXT_PRIMARY_COLOR,
    },
    secondary: {
      main: TEXT_SECONDARY_COLOR,
    },
    error: {
      main: red.A400,
    },
    action: {
      disabled: "rgba(255, 255, 255, 0.2)",
      disabledBackground: "rgba(255, 255, 255, 0.2)",
    },
    text: {
      primary: "#fff",
      secondary: "#444",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        sx: {
          borderRadius: "0.5rem",
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        sx: {
          borderRadius: "0.5rem",
        },
      },
      styleOverrides: {
        root: {
          color: TEXT_PRIMARY_COLOR
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true,
        disableFocusRipple: true
      },
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '4px 8px'
          },
          border: "none !important",
          textTransform: "none",
          borderRadius: "20px", //"0.5rem",
          fontWeight: 600,
          fontSize: "12px",
        },
        outlined: {
          background: BACKGROUND_LIGHT_GRAY,
          color: BACKGROUND_PRIMARY_COLOR,
          ":hover": {
            background: BACKGROUND_LIGHT_GRAY,
            color: BACKGROUND_SECONDARY_COLOR
          },
          ":disabled": {
            background: alpha(BACKGROUND_LIGHT_GRAY, 0.7),
            color: alpha(TEXT_PRIMARY_COLOR, 0.7)
          }
        },
        contained: {
          background: BACKGROUND_SECONDARY_COLOR,
          ":hover": {
            background: BACKGROUND_SECONDARY_COLOR,
            color: TEXT_PRIMARY_COLOR
          },
          ":disabled": {
            background: alpha(BACKGROUND_SECONDARY_COLOR, 0.2),
            color: alpha(TEXT_PRIMARY_COLOR, 0.5)
          }
        },
        text: {
          border: "none",
          "&:hover": {
            background: "none",
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true,
      },
    },
    MuiLink:
    {
      styleOverrides: {
        root: {
          color: TEXT_PRIMARY_COLOR,
          textDecoration: 'none',
          cursor: "pointer",
          '&:hover': {
            textDecoration: 'underline',
          },
        }
      }
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
        disableFocusRipple: true,
        disableTouchRipple: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(BACKGROUND_SECONDARY_COLOR, 1)
          },
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: "inherit",
          //color: alpha(TEXT_SECONDARY_COLOR, 0.54),
          cursor: "pointer",
          /* width: "16px",
          height: "16px", */
          "&.MuiSelect-icon": {
            color: alpha(TEXT_SECONDARY_COLOR, 0.54)
          }
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          //border: `1px solid ${alpha(BACKGROUND_PRIMARY_COLOR, 0.3)}`,
          //background: "rgba(0,0,0,0.2)", // "#131732",
          background: BACKGROUND_LIGHT_GRAY,
          marginBottom: "40px",
          overflow: 'hidden'
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "none",
        },
        head: {
          //color: alpha(TEXT_SECONDARY_COLOR, 0.87),
          color: TEXT_PRIMARY_COLOR,
          background: BACKGROUND_LIGHT_GRAY,
          borderBottom: `1px solid ${BACKGROUND_PRIMARY_COLOR}`,
          fontSize: "18px",
          //fontWeight: 500,
          lineHeight: "24px",
          letterSpacing: "0.17px",
        },
        body: {
          //color: "#fff",
          color: TEXT_PRIMARY_COLOR,
        },
        footer: {
          borderTop: `1px solid ${BACKGROUND_PRIMARY_COLOR}`,
        }
      },
    },
    MuiTableFooter: {
      styleOverrides: {
        root: {
          backgroundColor: BACKGROUND_LIGHT_GRAY
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: TEXT_PRIMARY_COLOR,
        },
        /* selectLabel: {
          //color: alpha(TEXT_INVERTED_COLOR, 0.6),
          color: TEXT_SECONDARY_COLOR,
        },
        selectIcon: {
          //color: alpha(TEXT_INVERTED_COLOR, 0.54),
          color: TEXT_SECONDARY_COLOR,
        }, */
        actions: {
          //color: alpha(TEXT_INVERTED_COLOR, 0.54),
          color: TEXT_PRIMARY_COLOR,
        },
      },
    },
    MuiList: {
      defaultProps: {
        sx: {
          color: TEXT_PRIMARY_COLOR,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          background: alpha("#fff", 0),
          color: TEXT_SECONDARY_COLOR,
          fontSize: 12
        }
      }
    },
    MuiPopover: {
      defaultProps: {
        sx: {
          color: TEXT_PRIMARY_COLOR,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BACKGROUND_PRIMARY_COLOR, 1),
          border: "1px solid rgba(190, 194, 218, 0.30)",
          borderRadius: "16px",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          color: TEXT_PRIMARY_COLOR,
          fontSize: "24px",
          fontStyle: "normal",
          fontWeight: "700",
          lineHeight: "133.4%",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: BACKGROUND_PRIMARY_COLOR, // "#131732",
          //padding: "4px 20px",
          borderRadius: "16px",
          border: "1px solid rgba(190, 194, 218, 0.30)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: TEXT_PRIMARY_COLOR,
          padding: "8px 20px",
          backgroundColor: "transparent",
          //"&.Mui-selected": { color: BACKGROUND_SECONDARY_COLOR, backgroundColor: "transparent !important" },
          //"&:hover": { color: `${BACKGROUND_SECONDARY_COLOR} !important` },
        },
        divider: {
          borderColor: "rgba(190, 194, 218, 0.12)",
          "&:last-child": {
            border: "none",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: "#f00",
          "&:hover": {
            background: BACKGROUND_SECONDARY_COLOR
          }
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          color: '#777'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // height: "56px",
        },
        notchedOutline: {
          border: "2px solid rgba(190, 194, 218, 0.23)",
          borderRadius: "8px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: MAIN_FONT_FAMILY,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: TEXT_PRIMARY_COLOR,
          "&.Mui-selected": { backgroundColor: BACKGROUND_SECONDARY_COLOR },
          "&.Mui-selected:hover": { backgroundColor: BACKGROUND_SECONDARY_COLOR },
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          //backgroundColor: BACKGROUND_PRIMARY_COLOR,
          color: TEXT_PRIMARY_COLOR,
          padding: 5
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: TEXT_PRIMARY_COLOR,
        },
        colorPrimary: { // track
          color: TEXT_PRIMARY_COLOR,
          "&.Mui-checked": {
            color: BACKGROUND_SECONDARY_COLOR,
          },
        },
        track: {
          opacity: 0.5,
          backgroundColor: TEXT_PRIMARY_COLOR,
          ".Mui-checked.Mui-checked + &": {
            backgroundColor: BACKGROUND_SECONDARY_COLOR,
          },
        }
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: {
          justifyContent: 'center'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          maxWidth: 'fit-content'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          outline: "none"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            opacity: 1,
          },
          opacity: 0.5,
          color: TEXT_PRIMARY_COLOR,
          padding: 0
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          //borderColor: "#ff0000",
          backgroundColor: '#000',
          boxShadow: "black 0 -10px 20px",
          '--DataGrid-containerBackground': '#111',
          '--DataGrid-rowBorderColor': '#111',
        },
        row: {
          border: "none",
          cursor: "pointer",
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transition: 'background-color 0.3s ease',
          },
        },
        cell: {
          borderColor: "rgba(255,255,255,0.3)"
        },
        footerContainer: {
          //borderColor: "#ff0000",
          borderTop: "none"
        },
        columnHeaders: {
          color: "#fff",
          backgroundColor: '#00FF00',
        },
      },
    }
  },
  mixins: {
    /* MuiDataGrid: {
      containerBackground: "#ff0000",
      
    }, */
  },
});

export default theme;
