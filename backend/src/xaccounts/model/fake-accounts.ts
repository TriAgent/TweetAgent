export type FakeXAccount = {
  userId: string;
  userName: string; // Bob
  userScreenName: string; // @bob
}

export const fakeAccounts: FakeXAccount[] = [
  { userId: "1111-1111-1111-1111-1111", userName: "Bob", userScreenName: "coolbob" },
  { userId: "2222-2222-2222-2222-2222", userName: "Sarah", userScreenName: "sarah123" },
  { userId: "3333-3333-3333-3333-3333", userName: "Ling Ling", userScreenName: "beijingling" },
];