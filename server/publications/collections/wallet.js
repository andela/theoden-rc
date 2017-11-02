import { Wallets } from "/lib/collections";

Meteor.publish("myTransactions", (userId) => {
  check(userId, String);
  return Wallets.find({ userId });
});
