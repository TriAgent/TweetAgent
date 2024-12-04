import { Expose, Type } from "class-transformer";
import { PostContestAirdrop } from "./post-contest-airdrop";

export class ContestAirdrop {
  @Expose() public id: string;
  @Expose() createdAt: Date;
  @Expose() totalTokenAmount: number;
  @Expose() tokenAddress: string;
  @Expose() chain: string;

  @Expose() @Type(() => PostContestAirdrop) postAirdrops: PostContestAirdrop[];
}