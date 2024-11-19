# Deployement requirements

- Server needs access to X, OpenAI, etc. Not blocked by China GFW.

# Initial setup

- Configure .env based on .env.sample
- `yarn`

# Initial twitter authentication

- Sign in to x.com with the bot X account
- `yarn twitter:auth`
- Click on the link in the console
- Accept the authentication in the browser, copy the provided PIN code.
- Paste the PIN code in the console, validate.
- The bot twitter authentication is not saved to database, you can exit.

# Starting the bot

- `docker-compose up -d`
- `yarn bot:run`

# Bot architecture

- We run a single bot but this bot has various features.
- Those features are launched through a scheduler (BotService) to ensure things run in a specific order.
- Features that fetch/send posts are queued one after another to make sure the same posts are not duplicated/conflicting.

# Main services

## News summary
- Follows some interesting crypto accounts on X and classifies their posts as real news or not.
- Generates and posts regular summaries about news published by those accounts.
- Replies to users that reply to our news.

## Airdrop contest
Acts as an automatic editor, retweeting good content provided by others. Third party content quality is evaluated, best content is determined, and tokens are airdropped to the best content providers. 

- The original post user can **mention the bot directly in his original post**, **or in a reply to his own post**. If other users mention the bot as a reply to another user’s post, this is dismissed.
- Every hour, we elect a post among contest posts not older than 6 hours ago. This gives a chance for a bit older posts to get elected, even among more recent posts that are maybe not as “good”. That elected post is published by the bot and mentions the original post’s account. The criteria being “select posts that have the best chance to gain popularity on X social network”. This is what we consider being “good” posts for now.
  - TBD: Can we “RT + post” here instead of just posting? So we have the original user’s post reference.
- Every day at a specific time, once per day, we **gather stats for all posts posted by the bot** (as a repost of users for the contest), and that have been posted more than 7 days ago but less than 8 days ago. We **compute a post “weight”** based on RT, views, likes etc. We **airdrop 1K tokens** to those (max) 24 posts **proportionally to their weight.**
- **We do not check fake news or click bait posts** for now, so they might become the ones that get RTed. But as we mention the original publisher, he’d better try not to post too much bad content. This said, as any anonymous X account can join, anyone can post bad content just for the airdrop, not to gain users.
- **The bot runs permanently**, it’s not a one time or on demand contest script. It airdrops 1K tokens per day, no matter how many users interact with it.
- In order to decide if a user post is **targeted for the contest, AI classifies** it with a criteria such as “Do you think this post is mentioning your (bot) name in order to join the contest? or for another reason?”

# Bot features

## x-posts-fetcher
- Gathers X posts from target accounts, or posts we are mentionned in.
- Those posts are later used by several features: could be for post contest, to gather airdrop address, to summarize news, or for anything else.

## x-posts-handler
- For every unhandled X post that is not from us:
  - manually ask features in sequence to generate a post reply (internally they use post classification, routing, etc for themselves)
  - features return their reply part. In the end, the replier can get reply parts from multiple features, and we ask AI to make a combined final reply. Then the post gets created and queued and will be sent by the sneder feature.

## x-posts-sender
- Sends all scheduled X posts to X. 
- Content is split in a thread if it doesn't fit in one post.
- In case of failure to send, retried later.
  
## x-real-news-filter
- Ask AI to check if a third party post is a real crypto news or not. Only posts categorized as real news are later used by the news summary writer.

## x-news-summary-writer
- AI generates news summary from time to time, based on third party users posts, and posts on X

## x-news-summary-replier
- Generates X replies to third party posts that replied to one of our "news summary" posts.

## TODO: airdrop/contest features

# Other services

- XPosts: database helper for posts coming/going from/to X.
- XAccounts: database helper to map X/cache user id and user screen names 

# Third party services

## Tavily - web search api (not used yet)

- https://tavily.com
- proctar.elastos@gmail.com (Google auth) on tavily.com
- free 1000 search/month

# About AI tool calls

- An initial AI model invocation can generate tool calls, if some tools have been provided, and the model thinks it has to use it.
- Also, for structured output (return JSON instead of strings from AI invocations), we use a specific tool instead of withStructuredOutput(), because this is how we can mix for regular tools AND structured output.
- The langchain service contains a helper method, fullyInvoke(), that iteratively invokes the model and appends more messages to the response, until all tools have been executed (tool calls need to be manually invoked and their output must be reinjected as new chat message into the model, then invoked again).