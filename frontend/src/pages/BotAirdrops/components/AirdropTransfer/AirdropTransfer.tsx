import { RouterLink } from "@components/base/RouterLink/RouterLink";
import { Grid, Stack } from "@mui/material";
import { Post } from "@pages/BotPosts/components/Post/Post";
import { ContestAirdrop } from "@services/airdrops/model/contest-airdrop";
import { PostContestAirdrop } from "@services/airdrops/model/post-contest-airdrop";
import { useChain } from "@services/chains/hooks/useChain";
import { formatAddress } from "@utils/formatAddress";
import { FC } from "react";
import { InfoLabel, InfoRow, TransferContainer } from "./AirdropTransfer.styles";

export const AirdropTransfer: FC<{
  postContestAirdrop: PostContestAirdrop;
  airdrop: ContestAirdrop;
}> = ({ airdrop, postContestAirdrop }) => {
  const chain = useChain(airdrop.chain);
  const token = chain?.tokens.find(t => t.address === airdrop.tokenAddress);

  return <TransferContainer>
    <Grid container>
      <Grid item xs={3}>
        <InfoRow>
          <InfoLabel>Amount</InfoLabel>
          {postContestAirdrop.tokenAmount} {token?.symbol}
        </InfoRow>
        <InfoRow>
          <InfoLabel>{postContestAirdrop.targetUser}</InfoLabel>
          <RouterLink to={`https://x.com/${postContestAirdrop.winningXAccount.userScreenName}`} target="_blank">@{postContestAirdrop.winningXAccount.userScreenName}</RouterLink>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Receiver</InfoLabel>
          <RouterLink to={chain?.explorerWalletUrl.replace("{walletAddress}", postContestAirdrop.airdropAddress)} target="_blank">
            {formatAddress(postContestAirdrop.airdropAddress, [6, 4])}
          </RouterLink>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Transaction</InfoLabel>
          {
            postContestAirdrop.transactionId &&
            <RouterLink to={chain?.explorerTransactionUrl.replace("{transaction}", postContestAirdrop.transactionId)} target="_blank">
              {formatAddress(postContestAirdrop.transactionId, [6, 4])}
            </RouterLink>
          }
          {
            !postContestAirdrop.transactionId && postContestAirdrop.shouldSendOnChain && "Unsent"
          }
          {
            !postContestAirdrop.transactionId && !postContestAirdrop.shouldSendOnChain && "Simulated"
          }
        </InfoRow>
        {/* Stats */}
        <Stack mt={1}>
          <InfoRow>
            <InfoLabel>Views</InfoLabel>
            {postContestAirdrop.impressionCount}
          </InfoRow>
          <InfoRow>
            <InfoLabel>Likes</InfoLabel>
            {postContestAirdrop.likeCount}
          </InfoRow>
          <InfoRow>
            <InfoLabel>RTs</InfoLabel>
            {postContestAirdrop.rtCount}
          </InfoRow>
          <InfoRow>
            <InfoLabel>Comments</InfoLabel>
            {postContestAirdrop.commentCount}
          </InfoRow>
        </Stack>
      </Grid>
      <Grid item xs={9}>
        <Post post={postContestAirdrop.quotePost} showActionBar={false} />
      </Grid>
    </Grid>
  </TransferContainer>
}