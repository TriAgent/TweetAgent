import { DebugCommentList } from "@components/data/DebugCommentList/DebugCommentList";
import { PostWriterModalContext } from "@components/modals/PostWriterModal/PostWriterModal";
import { Comment, Repeat, Star } from "@mui/icons-material";
import { Icon, IconButton, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { usePostByXPostId } from "@services/posts/hooks/usePost";
import { XPost } from "@services/posts/model/x-post";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { formatDate } from "@utils/dates";
import { FC, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostTags } from "../PostTags/PostTags";
import { HeaderSecondaryLabel, HeaderUserNameLabel, PostTextContainer, QuotedPostContainer, RepliedToLabel } from "./Post.styles";

export const Post: FC<{
  post: XPost;
  showActionBar?: boolean;
}> = ({ post, showActionBar = true }) => {
  const navigate = useNavigate();
  const activeBot = useActiveBot();
  const { openPostWriter } = useContext(PostWriterModalContext);
  const parentPost = usePostByXPostId(post.parentPostId);
  const quotedPost = usePostByXPostId(post.quotedPostId);
  const botIsAuthor = post.xAccountUserId === activeBot?.twitterUserId;
  const debugComments = useBehaviorSubject(post.debugComments$);
  const [showNotes, setShowNotes] = useState(false);

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
      {debugComments?.length > 0 && <HeaderSecondaryLabel onClick={() => setShowNotes(!showNotes)} style={{ cursor: "pointer" }}>{debugComments?.length} notes</HeaderSecondaryLabel>}
    </Stack>

    {showNotes && <DebugCommentList comments={debugComments} />}

    {/* Main content */}
    <PostTextContainer>
      <div onClick={() => handlePostClicked(post)} style={{ cursor: "pointer" }}>{post.text}</div>
      {
        parentPost &&
        <RepliedToLabel onClick={() => handlePostClicked(parentPost)}>Replied to {parentPost.xAccount.userName} (@{parentPost.xAccount.userScreenName}) about: {parentPost.text.substring(0, 30)}...</RepliedToLabel>
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

        <PostTags post={post} />
      </Stack>
    }
  </Stack>
}