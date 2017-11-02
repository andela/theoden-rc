import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
 * Transaction Schema
 */

export const Transaction = new SimpleSchema({
  amount: {
    type: Number,
    decimal: true,
    label: "Amount"
  },
  referenceId: {
    type: String,
    optional: true
  },
  transactionType: {
    type: String
  },
  from: {
    type: String,
    optional: true
  },
  to: {
    type: String,
    optional: true
  },
  orderId: {
    type: String,
    optional: true
  },
  date: {
    type: Date
  }
});

/**
 * Wallet Schema
 */

export const Wallet = new SimpleSchema({
  userId: {
    type: String,
    label: "User"
  },
  transactions: {
    type: [Transaction],
    optional: true
  },
  balance: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    optional: true
  }
});
