import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { BACKGROUND_PRIMARY_COLOR, BACKGROUND_SECONDARY_COLOR, TEXT_PRIMARY_COLOR } from 'src/constants';

export const IosSwitch = styled(Switch)(({ theme }) => ({
  width: 46,
  height: 30,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 1,
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: BACKGROUND_SECONDARY_COLOR,
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 28,
    height: 28,
  },
  '& .MuiSwitch-track': {
    borderRadius: 13,
    backgroundColor: alpha(TEXT_PRIMARY_COLOR, 0.2),
    opacity: 1,
  },
}));
