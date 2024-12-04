import { Grid } from "@mui/material";
import { Post } from "@pages/BotPosts/components/Post/Post";
import { PostContestAirdrop } from "@services/airdrops/model/post-contest-airdrop";
import { formatAddress } from "@utils/formatAddress";
import { FC } from "react";
import { TransferContainer } from "./AirdropTransfer.styles";

export const AirdropTransfer: FC<{
  postContestAirdrop: PostContestAirdrop;
}> = ({ postContestAirdrop }) => {
  console.log(postContestAirdrop)
  return <TransferContainer>
    <Grid container>
      <Grid item xs={3}>
        <div>{postContestAirdrop.tokenAmount} tokens</div>
        <div>@{postContestAirdrop.winningXAccount.userScreenName} ({postContestAirdrop.targetUser})</div>
        <div>{formatAddress(postContestAirdrop.airdropAddress, [6, 4])}</div>
        <div>Transaction {formatAddress(postContestAirdrop.transactionId, [6, 4])}</div>
        <div>{postContestAirdrop.impressionCount} views</div>
        <div>{postContestAirdrop.likeCount} likes</div>
        <div>{postContestAirdrop.rtCount} RTs</div>
        <div>{postContestAirdrop.commentCount} comments</div>
      </Grid>
      <Grid item xs={9}>
        <Post post={postContestAirdrop.quotePost} showActionBar={false} />
      </Grid>
    </Grid>
  </TransferContainer>
}