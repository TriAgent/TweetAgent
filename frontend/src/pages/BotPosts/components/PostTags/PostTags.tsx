import { alpha, Stack } from "@mui/material";
import { PostTag } from "@services/features/feature-handler";
import { XPost } from "@services/posts/model/x-post";
import { FC, useCallback } from "react";
import { TagLabel } from "./PostTags.styles";

export const PostTags: FC<{
  post: XPost;
}> = ({ post }) => {
  const tags = post?.getTags();

  const tagBackgroundColor = useCallback((tag: PostTag) => {
    switch (tag.type) {
      case "default": return alpha("#FFFFFF", 0.5);
      case "success": return alpha("#00FF00", 0.5);
      case "warning": return alpha("#f2cb0c", 0.5);
      case "error": return alpha("#ff0000", 0.5);
    }
  }, []);

  return <Stack direction="row" gap={1}>
    {
      tags?.map((tag, i) => <TagLabel key={i} style={{ backgroundColor: tagBackgroundColor(tag) }}>{tag.label}</TagLabel>)
    }
  </Stack>
}