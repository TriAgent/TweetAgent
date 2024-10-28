import { Injectable } from '@nestjs/common';
import { WebSearchNewsService } from './web-search/web-search.service';
import { XPostsNewsService } from './x-posts/x-posts.service';

/**
 * Fetches crypto news, AI-evaluates if this sounds like a new trending topic, extracts keywords.
 */
@Injectable()
export class CryptoNewsService {
   constructor(private web: WebSearchNewsService, private xposts: XPostsNewsService) { }

   public run() {
      // Launch news sources.
      this.xposts.run();
   }
}
