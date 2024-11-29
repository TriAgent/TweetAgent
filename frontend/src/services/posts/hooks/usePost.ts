import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { useEffect, useState } from "react";
import { XPost } from "../model/x-post";

/**
 * Retrieves a post by its X post id for the currently active bot.
 */
export const usePostByXPostId = (postId: string): XPost=> {
  const [post, setPost] = useState<XPost>();
  const activeBot = useActiveBot();

  useEffect(() => {
    if (activeBot && postId) {
      activeBot.fetchPostByPostId(postId).then(_post => {
        setPost(_post);
      });
    }
    else 
      setPost(undefined);
  }, [activeBot, postId]);

  return post;
}