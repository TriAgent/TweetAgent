import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { FakeXAccountSelect } from "@components/data/FakeXAccountSelect/FakeXAccountSelect";
import { Button, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, useCallback, useState } from "react";

export const NewPostField: FC = () => {
  const activeBot = useActiveBot();
  const [postText, setPostText] = useState("");
  const [authorAccount, setAuthorAccount] = useState<XAccount>(undefined);

  const handleSendAsCommentOrNew = useCallback(async () => {
    const createdPost = await activeBot.createPost({
      text: postText,
      xAccountUserId: authorAccount.userId
    });

    console.log("Post created:", createdPost)
  }, [activeBot, authorAccount, postText]);

  const handleSendAsQuote = useCallback(async () => {

  }, []);

  return <Stack direction="row" gap={2}>
    <DebouncedTextField label="What is happening?" onChange={setPostText} debounceTime={0} />
    <FakeXAccountSelect onAccountSelected={setAuthorAccount} />
    <Button variant="contained" disabled={!postText} onClick={handleSendAsCommentOrNew}>Comment</Button>
    <Button variant="contained" disabled={!postText} onClick={handleSendAsQuote}>Quote</Button>
  </Stack>
}