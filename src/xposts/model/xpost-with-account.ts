import { XAccount, XPost } from "@prisma/client";

export type XPostWithAccount = XPost & {
  xAccount: XAccount;
}