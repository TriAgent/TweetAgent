import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Add } from "@mui/icons-material";
import { IconButton, List, ListItemButton, ListItemText, Stack } from "@mui/material";
import { createBot } from "@services/bots/bots.service";
import { useBots } from "@services/bots/hooks/useBots";
import { Bot } from "@services/bots/model/bot";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BotsList: FC = () => {
  const bots = useBots();
  const navigate = useNavigate();

  const handleCreateBot = useCallback(() => {
    createBot();
  }, []);

  const handleBotClicked = useCallback((bot: Bot) => {
    navigate(`/bots/${bot.id}`);
  }, [navigate]);

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
          {bots.map((bot, i) => (
            <ListItemButton key={i} onClick={() => handleBotClicked(bot)}>
              <ListItemText primary={bot.name} />
            </ListItemButton>
          ))}
        </List>
      </Stack>
    </>
  );
};

export default BotsList;
