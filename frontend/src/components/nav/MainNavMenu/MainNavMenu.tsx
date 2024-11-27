import { BotSelect } from "@components/data/BotSelect/BotSelect";
import { DataSavedLabel } from "@components/data/DataSavedLabel/DataSavedLabel";
import { List, ListItemButton, ListItemText, ListSubheader, Stack } from "@mui/material";
import { activeBot$, setActiveBot } from "@services/bots/bots.service";
import { Bot } from "@services/bots/model/bot";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type NavItem = {
  title: string;
  path: string;
}

type NavGroup = {
  title: string;
  items: NavItem[];
}

export const MainNavMenu: FC = () => {
  const navigate = useNavigate();
  const activeBot = useBehaviorSubject(activeBot$);

  const navItems = useMemo(() => {
    const items: NavGroup[] = [
      {
        title: "Global",
        items: [
          { title: "Bots", path: "/bots" },
        ]
      }
    ];

    if (activeBot) {
      items.push({
        title: "Selected Bot",
        items: [
          { title: "Settings", path: `/bot/settings` },
          { title: "Prompts", path: `/bot/prompts` },
        ]
      })
    }

    return items;
  }, [activeBot]);

  const handleNavItemClicked = useCallback((item: NavItem) => {
    navigate(item.path);
  }, [navigate]);

  const handleActiveBotChange = useCallback((bot: Bot) => {
    setActiveBot(bot);
  }, []);

  return <Stack direction="column" padding={2} mt={3}>
    <BotSelect bot={activeBot} onChange={handleActiveBotChange} />
    {
      navItems.map((group, gi) => (
        <List key={gi} subheader={
          <ListSubheader component="div">{group.title}</ListSubheader>
        }>
          {group.items.map((item, ii) => (
            <ListItemButton key={ii} onClick={() => handleNavItemClicked(item)}>
              <ListItemText primary={item.title} />
            </ListItemButton>
          ))}
        </List>
      ))
    }
    <DataSavedLabel width="100%" />
  </Stack>
}