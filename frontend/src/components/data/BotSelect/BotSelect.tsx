import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useBots } from '@services/bots/hooks/useBots';
import { Bot } from '@services/bots/model/bot';
import { FC } from 'react';

export const BotSelect: FC<{
  bot: Bot;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (bot: Bot) => void;
}> = ({ bot, onChange }) => {
  const bots = useBots();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const targetToken = bots.find(t => t.id === event.target.value);
    onChange(targetToken);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="select-label">Selected bot</InputLabel>
      <Select
        labelId='select-label'
        value={bot?.id || ''}
        onChange={handleChange}
        label="Select bot"
      >
        {
          bots?.map(bot => <MenuItem key={bot.id} value={bot.id}>{bot.name}</MenuItem>)
        }
      </Select>
    </FormControl>
  );
};
