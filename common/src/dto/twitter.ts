export type TwitterAuthenticationRequest = {
  oauth_token: string;
  oauth_token_secret: string;
  url: string;
}

export type LinkedTwitterAccountInfo = {
  twitterUserId?: string; // X user id eg: 1849649146669695000
  twitterUserName?: string; // X user name eg: Proctar Elastos
  twitterUserScreenName?: string; // X user name eg: proctar2626
  twitterAccessToken?: string; // X access token for this user, after web/pin authorization
  twitterAccessSecret?: string; // X secret token for this user, after web/pin authorization
}