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

# Third party services

## Tavily - web search api (not used yet)

- https://tavily.com
- proctar.elastos@gmail.com (Google auth) on tavily.com
- free 1000 search/month
