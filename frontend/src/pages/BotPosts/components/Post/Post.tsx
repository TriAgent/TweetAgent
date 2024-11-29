import { PostWriterModalContext } from "@components/modals/PostWriterModal/PostWriterModal";
import { Check, Close, Comment, Repeat, Star } from "@mui/icons-material";
import { Icon, IconButton, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { usePostByXPostId } from "@services/posts/hooks/usePost";
import { XPost } from "@services/posts/model/x-post";
import { formatDate } from "@utils/dates";
import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSecondaryLabel, HeaderUserNameLabel, PostSubInfo, PostTextContainer, QuotedPostContainer, RepliedToLabel } from "./Post.styles";

export const Post: FC<{
  post: XPost;
  showActionBar?: boolean;
}> = ({ post, showActionBar = true }) => {
  const navigate = useNavigate();
  const activeBot = useActiveBot();
  const { openPostWriter } = useContext(PostWriterModalContext);
  const parentPost = usePostByXPostId(post.parentPostId);
  const quotedPost = usePostByXPostId(post.quotedPostId);
  const botIsAuthor = post.xAccountUserId === activeBot.twitterUserId;

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

  return <Stack direction="column" gap={0} style={{ width: "100%" }}>
    <Stack direction="row" gap={2} alignItems="center">
      <Stack direction="row" alignItems="center">
        {botIsAuthor && <Icon style={{ fontSize: 18 }}><Star style={{ color: "yellow" }} /></Icon>}
        <HeaderUserNameLabel>{post.xAccount.userName}</HeaderUserNameLabel>
      </Stack>
      <HeaderSecondaryLabel>@{post.xAccount.userScreenName}</HeaderSecondaryLabel> <HeaderSecondaryLabel>{formatDate(post.createdAt)}</HeaderSecondaryLabel>
    </Stack>

    {/* Main content */}
    <PostTextContainer>
      <div onClick={() => handlePostClicked(post)} style={{ cursor: "pointer" }}>{post.text}</div>
      {
        parentPost &&
        <RepliedToLabel onClick={() => handlePostClicked(parentPost)}>Replied to @{parentPost.xAccount.userName} about {parentPost.text.substring(0, 30)}...</RepliedToLabel>
      }
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
          <Icon>{!post.isSimulated ? <Check /> : <Close />}</Icon>
          <PostSubInfo>{!post.isSimulated ? "Real post" : "Simulated post"}</PostSubInfo>
        </Stack>
        <Stack alignItems="center">
          <Icon>{!post.isSimulated && post.publishedAt ? <Check /> : <Close />}</Icon>
          <PostSubInfo>{!post.isSimulated && post.publishedAt ? "Published" : "Not published"}</PostSubInfo>
        </Stack>
      </Stack>
    }
  </Stack>
}