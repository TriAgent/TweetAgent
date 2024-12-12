import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useBots } from '@services/bots/hooks/useBots';
import { Bot } from '@services/bots/model/bot';
import { useBehaviorSubject } from '@services/ui-ux/hooks/useBehaviorSubject';
import { FC } from 'react';

export const BotSelect: FC<{
  bot: Bot;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (bot: Bot) => void;
}> = ({ bot, onChange }) => {
  const bots = useBots();
  const activeBotName = useBehaviorSubject(bot?.name$);

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
        renderValue={() => activeBotName}
      >
        {
          /* Note : Mui Select cannto accept a custom component... */
          bots?.map((bot, i) => <MenuItem key={i} value={bot.id}>{bot.name$.value}</MenuItem>)
        }
      </Select>
    </FormControl>
  );
};