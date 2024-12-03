import { Modal, ModalProps, Stack } from "@mui/material";
import { NewPostField } from "@pages/BotPosts/components/NewPostField/NewPostField";
import { Post } from "@pages/BotPosts/components/Post/Post";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { XPost } from "@services/posts/model/x-post";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, ReactNode, createContext, memo, useCallback, useState } from "react";
import { ModalRootCard } from "../ModalRootCard/ModalRootCard";

export type WritePostMode = | "reply" | "quote";

/**
 * Modal to write replies/quotes about a parent post
 */
export const PostWriterModal: FC<Omit<ModalProps, "children"> & {
  originPost: XPost; // Post we are starting this action from. Could be the future parent (for replies) or the post we are going to quote.
  onHandleClose: () => void;
  writeMode: WritePostMode;
}> = ({ originPost, writeMode, ...props }) => {
  const { open, onHandleClose, ...rest } = props;
  const activeBot = useActiveBot();
  const isReply = writeMode === "reply";
  const isQuote = writeMode === "quote";
  const title = isReply ? "Post your reply" : "Your quote message";

  const handleCreatePost = useCallback(async (text: string, authorAccount: XAccount) => {
    let createdPost: XPost;

    if (writeMode === "reply")
      createdPost = await activeBot.createPost(text, authorAccount, originPost.postId, undefined);
    else
      createdPost = await activeBot.createPost(text, authorAccount, undefined, originPost.postId);

    console.log("Post created:", createdPost);

    onHandleClose();

    // TODO
    // if reply: open parent post page
    // if quote: open root posts page
  }, [activeBot, onHandleClose, originPost, writeMode]);

  return (
    <Modal {...rest} open={open} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description" onClose={onHandleClose}>
      <ModalRootCard style={{ width: "auto" }}>
        <Stack p={2} gap={4}>
          {/* Show parent post preview at the top is this is for a reply */}
          {isReply && <Post post={originPost} showActionBar={false} />}
          <NewPostField title={title} mode={writeMode} width={400} onPost={handleCreatePost} />
          {/* For quoted posts, show post preview after the new post text */}
          {isQuote && <Post post={originPost} showActionBar={false} />}
        </Stack>
      </ModalRootCard>
    </Modal>
  );
};

export const PostWriterModalProvider: FC<{ children: ReactNode }> = memo(({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originPost, setOriginPost] = useState<XPost>(undefined);
  const [writeMode, setWriteMode] = useState<WritePostMode>(undefined);

  const openPostWriter = (mode: WritePostMode, _originPost: XPost) => {
    setIsOpen(true);
    setOriginPost(_originPost);
    setWriteMode(mode);
  }

  return (
    <PostWriterModalContext.Provider value={{ openPostWriter }}>
      {children}
      <PostWriterModal open={isOpen} onHandleClose={() => setIsOpen(false)} originPost={originPost} writeMode={writeMode} />
    </PostWriterModalContext.Provider>
  );
});

export const PostWriterModalContext = createContext<{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openPostWriter: (mode: WritePostMode, parentPost: XPost) => void;
}>(null);