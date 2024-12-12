import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Add } from "@mui/icons-material";
import { IconButton, List, ListItemButton, ListItemText, Stack } from "@mui/material";
import { createBot, setActiveBot } from "@services/bots/bots.service";
import { useBots } from "@services/bots/hooks/useBots";
import { Bot } from "@services/bots/model/bot";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BotsList: FC = () => {
  const bots = useBots();

  const handleCreateBot = useCallback(() => {
    createBot();
  }, []);

  return (
    <>
      <Stack direction="column">
        <Stack direction="row" alignItems="center" gap={2}>
          <PageTitle>Bots</PageTitle>
          <IconButton size="small" onClick={handleCreateBot}>
            <Add />
          </IconButton>
        </Stack>
        <List>
          {bots.map((bot, i) => <BotEntry key={i} bot={bot} />)}
        </List>
      </Stack>
    </>
  );
};


const BotEntry: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const name = useBehaviorSubject(bot.name$);
  const navigate = useNavigate();

  const handleBotClicked = useCallback((bot: Bot) => {
    setActiveBot(bot);
    navigate(`/bot/settings`);
  }, [navigate]);

  return <ListItemButton onClick={() => handleBotClicked(bot)}>
    <ListItemText primary={name} />
  </ListItemButton>
}

export default BotsList;
