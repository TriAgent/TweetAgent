export type XAccount = {
  id: string;

  userId: string; // X user id eg: 1849649146669695000
  userName: string; // X user name eg: Proctar Elastos
  userScreenName: string; // X user name eg: proctar2626

  // Specific to: airdrop contest
  airdropAddress?: string; // Blockchain address where to airdrop tokens if this user wins a contest competition
}