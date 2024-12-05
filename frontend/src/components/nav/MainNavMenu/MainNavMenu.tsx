import { ActiveFeatureAction } from "@components/data/ActiveFeatureAction/ActiveFeatureAction";
import { BotSelect } from "@components/data/BotSelect/BotSelect";
import { DataSavedLabel } from "@components/data/DataSavedLabel/DataSavedLabel";
import { List, ListItemButton, ListItemText, ListSubheader, Stack } from "@mui/material";
import { activeBot$, setActiveBot } from "@services/bots/bots.service";
import { Bot } from "@services/bots/model/bot";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-use";

type NavItem = {
  title: string;
  path: string;
}

type NavGroup = {
  title: string;
  items: NavItem[];
}

export const MainNavMenu: FC = () => {
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
          { title: "Features", path: `/bot/features` },
          { title: "Prompts", path: `/bot/prompts` },
          { title: "Posts", path: `/bot/posts` },
          { title: "Airdrops", path: `/bot/airdrops` },
        ]
      })
    }

    return items;
  }, [activeBot]);

  const handleActiveBotChange = useCallback((bot: Bot) => {
    setActiveBot(bot);
  }, []);

  return <Stack direction="column" padding={2} mt={3}>
    <BotSelect bot={activeBot} onChange={handleActiveBotChange} />
    <Stack direction="column" gap={3} mt={3}>
      {
        navItems.map((group, gi) => <NavGroupComponent key={gi} group={group} />)
      }
    </Stack>
    <ActiveFeatureAction />
    <DataSavedLabel width="100%" />
  </Stack>
}

const NavGroupComponent: FC<{
  group: NavGroup;
}> = ({ group }) => {
  return <List subheader={<ListSubheader component="div">{group.title}</ListSubheader>}>
    {group.items.map((item, i) => <NavItemComponent key={i} item={item} />)}
  </List>
}

const NavItemComponent: FC<{ item: NavItem }> = ({ item }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavItemClicked = useCallback(() => {
    navigate(item.path);
  }, [navigate, item.path]);

  // Determine if the current location path starts with the nav item path
  const isSelected = useMemo(() => location.pathname.startsWith(item.path), [item, location.pathname]);

  return (
    <ListItemButton onClick={handleNavItemClicked} selected={isSelected}>
      <ListItemText primary={item.title} />
    </ListItemButton>
  );
};