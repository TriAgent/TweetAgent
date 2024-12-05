import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import { InfoLabel, InfoRow } from '@pages/BotAirdrops/components/AirdropTransfer/AirdropTransfer.styles';
import { HeaderSecondaryLabel } from '@pages/BotPosts/components/Post/Post.styles';
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC } from "react";

export const AccountDetails: FC<{
  account: XAccount;
  expandedAccordionId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAccordionChange: (isExpanded: boolean) => void;
}> = ({ account, expandedAccordionId, onAccordionChange }) => {
  return <Accordion expanded={expandedAccordionId === account.userId} onChange={(e, isExpanded) => onAccordionChange(isExpanded)}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Stack direction="row" gap={1}>
        <Typography style={{ textTransform: "capitalize" }}>{account.userName}</Typography>
        <HeaderSecondaryLabel>@{account.userScreenName}</HeaderSecondaryLabel>
      </Stack>
    </AccordionSummary>
    <AccordionDetails>
      <Stack>
        <InfoRow><InfoLabel>User ID</InfoLabel>{account.userId}</InfoRow>
        <InfoRow><InfoLabel>User Name</InfoLabel>{account.userName}</InfoRow>
        <InfoRow><InfoLabel>User Screen Name</InfoLabel>@{account.userScreenName}</InfoRow>
        <InfoRow><InfoLabel>Airdrop address</InfoLabel>{account.airdropAddress}</InfoRow>
      </Stack>

    </AccordionDetails>
  </Accordion>
}