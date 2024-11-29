import { PostWriterModalContext } from "@components/modals/PostWriterModal/PostWriterModal";
import { Check, Close, Comment, Message, Repeat } from "@mui/icons-material";
import { Icon, IconButton, Stack } from "@mui/material";
import { usePostByXPostId } from "@services/posts/hooks/usePost";
import { XPost } from "@services/posts/model/x-post";
import { formatDate } from "@utils/dates";
import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSecondaryLabel, HeaderUserNameLabel, PostSubInfo, PostTextContainer, QuotedPostContainer } from "./Post.styles";

export const Post: FC<{
  post: XPost;
  showActionBar?: boolean;
}> = ({ post, showActionBar = true }) => {
  const navigate = useNavigate();
  const { openPostWriter } = useContext(PostWriterModalContext);
  const quotedPost = usePostByXPostId(post.quotedPostId);

  console.log("quotedPost", post.quotedPostId, quotedPost)

  const handlePostClicked = useCallback((post: XPost) => {
    navigate(`/bot/posts/${post.id}`);
  }, [navigate]);

  const handleCreateComment = useCallback(() => {
    openPostWriter("reply", post);
  }, [openPostWriter, post]);

  const handleCreateQuote = useCallback(() => {
    openPostWriter("quote", post);
  }, [openPostWriter, post]);

  return <Stack direction="column" gap={0}>
    <Stack direction="row" gap={2}>
      <HeaderUserNameLabel>{post.xAccount.userName}</HeaderUserNameLabel> <HeaderSecondaryLabel>@{post.xAccount.userScreenName}</HeaderSecondaryLabel> <HeaderSecondaryLabel>{formatDate(post.publishedAt)}</HeaderSecondaryLabel>
    </Stack>

    {/* Main content */}
    <PostTextContainer>
      <div onClick={() => handlePostClicked(post)}>{post.text}</div>
      {/* Quoted post, if any */}
      {
        quotedPost &&
        <QuotedPostContainer>
          <Post post={quotedPost} showActionBar={false} />
        </QuotedPostContainer>
      }
    </PostTextContainer>

    {/* Action buttons */}
    {
      showActionBar &&
      <Stack alignItems="center" justifyItems="center" direction="row" gap={1}>
        <IconButton onClick={handleCreateComment}>
          <Comment />
        </IconButton>
        <IconButton onClick={handleCreateQuote}>
          <Repeat />
        </IconButton>

        <Stack ml={5} alignItems="center">
          <Icon>{post.wasReplyHandled ? <Check /> : <Close />}</Icon>
          <PostSubInfo>{post.wasReplyHandled ? "Reply handled" : "Reply not handled"}</PostSubInfo>
        </Stack>
        <Stack alignItems="center">
          <Icon><Message /></Icon>
          <PostSubInfo>{post.isSimulated ? "Simulated post" : "Real post"}</PostSubInfo>
        </Stack>
      </Stack>
    }
  </Stack>
}