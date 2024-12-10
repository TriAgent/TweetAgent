import { Stack } from "@mui/material";
import { useBotById } from "@services/bots/hooks/useBotById";
import { useFeatureProvider } from "@services/features/hooks/useFeatureProvider";
import { DebugComment } from "@x-ai-wallet-bot/common";
import { FC, useMemo } from "react";
import { CommentFeatureProviderTitle, CommentText } from "./DebugCommentList.styles";

export const DebugCommentList: FC<{
  comments: DebugComment[];
}> = ({ comments }) => {
  if (!comments)
    return null;

  return <Stack gap={1} mt={1} mb={1} ml={2}>
    {
      comments.map((comment, i) => <DebugCommentEntry key={i} comment={comment} />)
    }
  </Stack>
}

export const DebugCommentEntry: FC<{
  comment: DebugComment;
}> = ({ comment }) => {
  const bot = useBotById(comment.botId);
  const feature = useMemo(() => bot.getFeatureById(comment?.featureId), [comment, bot]);
  const provider = useFeatureProvider(feature);

  return <Stack>
    <CommentFeatureProviderTitle>{provider?.groupType} / {provider?.title}</CommentFeatureProviderTitle>
    <CommentText>{comment.text}</CommentText>
  </Stack>
}
