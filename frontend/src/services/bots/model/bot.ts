import { ContestAirdrop } from "@services/airdrops/model/contest-airdrop";
import { apiGet, apiPost, apiPut } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { PostChildren } from "@services/posts/model/post-thread";
import { XPost } from "@services/posts/model/x-post";
import { onPostUpdate$ } from "@services/posts/posts.service";
import { notifyDataSaved } from "@services/ui-ux/ui.service";
import { AiPrompt as AiPromptDTO, Bot as BotDTO, BotFeature as BotFeatureConfigDTO, ContestAirdrop as ContestAirdropDTO, LinkerTwitterAccountInfo, TwitterAuthenticationRequest, XAccount as XAccountDTO, XPostCreationDTO, XPost as XPostDTO } from "@x-ai-wallet-bot/common";
import { Expose, instanceToPlain, plainToInstance } from "class-transformer";
import { BehaviorSubject, Subject } from "rxjs";
import { BotFeature } from "../../features/model/bot-feature";
import { setActiveBot } from "../bots.service";
import { AiPrompt } from "./ai-prompt";

export class Bot {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public twitterUserId?: string; // X user id eg: 1849649146669695000
  @Expose() public twitterUserName?: string; // X user name eg: Proctar Elastos
  @Expose() public twitterUserScreenName?: string; // X user name eg: proctar2626
  @Expose() public twitterAccessToken?: string; // X access token for this user, after web/pin authorization
  @Expose() public twitterAccessSecret?: string; // X secret token for this user, after web/pin authorization

  public prompts$ = new BehaviorSubject<AiPrompt[]>(undefined);
  public features$ = new BehaviorSubject<BotFeature[]>(undefined);

  public onNewPost$ = new Subject<XPost>();

  public async initialize(): Promise<void> {
    await Promise.all([
      this.fetchPrompts(),
      this.fetchFeatureConfigs()
    ]);

    onPostUpdate$.subscribe(post => {
      if (post.botId === this.id)
        this.onNewPost$.next(post);
    })
  }

  /**
   * Updates one of the root properties
   */
  public async updateProperty(key: Exclude<keyof BotDTO, "id">) {
    await apiPut(`${backendUrl}/bots`, {
      bot: instanceToPlain(this, { excludeExtraneousValues: true }),
      key
    }, undefined, "Failed to update bot");

    notifyDataSaved();
  }

  private async fetchPrompts() {
    const rawPrompts = await apiGet<AiPromptDTO[]>(`${backendUrl}/bots/${this.id}/prompts`);
    if (rawPrompts) {
      const prompts = plainToInstance(AiPrompt, rawPrompts, { excludeExtraneousValues: true });
      console.log("Got prompts", prompts)
      this.prompts$.next(prompts);
    }
  }

  private async fetchFeatureConfigs() {
    const rawConfigs = await apiGet<BotFeatureConfigDTO[]>(`${backendUrl}/bots/${this.id}/features`);
    if (rawConfigs) {
      const features = plainToInstance(BotFeature, rawConfigs, { excludeExtraneousValues: true });
      console.log("Got features", features)
      this.features$.next(features);
    }
  }

  public async startTwitterAuth(): Promise<TwitterAuthenticationRequest> {
    return apiPost<TwitterAuthenticationRequest>(`${backendUrl}/bots/${this.id}/twitter/auth`, {}, undefined, "Failed to start twitter auth");
  }

  public async finalizeTwitterAuthWithPIN(request: TwitterAuthenticationRequest, pinCode: string) {
    const authResult = await apiPut<LinkerTwitterAccountInfo>(`${backendUrl}/bots/${this.id}/twitter/auth`, { request, pinCode });

    // Refresh local model
    this.twitterUserId = authResult.twitterUserId;
    this.twitterUserName = authResult.twitterUserName;
    this.twitterUserScreenName = authResult.twitterUserScreenName;

    // Force UI refresh by overwriting ourselves
    setActiveBot(this);

    return authResult;
  }

  public async fetchPostByPostId(postId: string): Promise<XPost> {
    const rawPost = await apiGet<XPostDTO>(`${backendUrl}/bots/${this.id}/posts/${postId}`);
    if (rawPost) {
      return plainToInstance(XPost, rawPost, { excludeExtraneousValues: true });
    }

    return undefined;
  }

  /**
   * Fetches posts. 
   * - If rootPostId is not given, fetches all root posts (no parent)
   * - If rootPostId is given, fetches that root post, and all its children posts
   */
  public async fetchPosts(rootPostId?: string): Promise<PostChildren> {
    let url = `${backendUrl}/bots/${this.id}/posts`;
    if (rootPostId)
      url += `?root=${rootPostId}`;

    const rawThread = await apiGet<PostChildren>(url);
    if (rawThread) {
      const root = rawThread.root && plainToInstance(XPost, rawThread.root, { excludeExtraneousValues: true });
      const posts = plainToInstance(XPost, rawThread.posts, { excludeExtraneousValues: true });
      console.log("Got posts:", posts, "with root:", root);
      return {
        root,
        posts
      };
    }

    return null;
  }

  public async createPost(text: string, xAccount: XAccountDTO, parentPostId?: string, quotedPostId?: string): Promise<XPost> {
    // Special case for comments - to simulate X, we need to make sure the bot is mentionned in the comment text.
    if (parentPostId) {
      const botMention = `@${this.twitterUserScreenName}`;
      if (!text.includes(botMention)) 
        text = `${botMention} ${text.trim()}`;
    }

    const postCreationInput: XPostCreationDTO = {
      text,
      xAccountUserId: xAccount.userId,
      parentPostId,
      quotedPostId
    };
    const rawPost = await apiPost<XPostDTO>(`${backendUrl}/bots/${this.id}/posts`, postCreationInput);

    if (!rawPost)
      return null;

    const post = plainToInstance(XPost, rawPost, { excludeExtraneousValues: true });

    return post;
  }

  public async fetchAirdrops():Promise<ContestAirdrop[]> {
    const rawAirdrops = await apiGet<ContestAirdropDTO[]>(`${backendUrl}/bots/${this.id}/airdrops`);
    if (rawAirdrops) {
      console.log("Got airdrops:", rawAirdrops);
      return rawAirdrops.map(ra => plainToInstance(ContestAirdrop, ra, {excludeExtraneousValues: true}));
    }

    return null;
  }
}