import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Random } from "meteor/random";

export const StaticPages = new SimpleSchema({
  _id: {
    type: String,
    defaultValue: Random.id(),
    optional: true
  },
  pageTitle: {
    type: String,
    label: "pageTitle",
    index: true,
    unique: true
  },
  slug: {
    type: String,
    label: "slug",
    index: true,
    unique: true
  },
  category: {
    type: String,
    optional: true
  },
  content: {
    type: String,
    label: "content"
  },
  shopId: {
    type: String,
    label: "shopId"
  },
  owner: {
    type: String,
    label: "owner"
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
      denyUpdate: true;
    }
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
});
