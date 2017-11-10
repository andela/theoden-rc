import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
// import { getSlug } from "/lib/api";
import { StaticPages } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

Meteor.methods({
  /**
    * Creates a Static Page
    * @param {String} pageTitle page title
    * @param {String} slug page slug
    * @param {String} category page category
    * @param {String} content page Content
    * @param {String} shopId ShopId of the page
    * @param {String} owner vendor/Admin id
    * @returns {Boolean} Page Insert Success
   */
  "staticPages/createPage": function (pageTitle,
    slug,
    category,
    content,
    shopId,
    owner) {
    check(pageTitle, String);
    check(slug, String);
    check(category, String);
    check(content, String);
    check(shopId, String);
    check(owner, String);
    // TODO check permissions for page

    const pageDetails = {
      pageTitle,
      slug,
      category,
      content,
      shopId,
      owner,
      createdAt: new Date()
    };
    check(pageDetails, Schemas.StaticPages);

    return StaticPages.insert(pageDetails);
  },
  /**
    * Creates a Static Page
    * @param {String} pageTitle page title
    * @param {String} slug page slug
    * @param {String} category page category
    * @param {String} content page Content
    * @param {String} shopId ShopId of the page
    * @param {String} _id StaticPage Id
    * @returns {Boolean} Page Insert Success
   */
  "staticPages/editPage": function (pageTitle,
    slug,
    category,
    content,
    shopId,
    _id) {
    check(pageTitle, String);
    check(slug, String);
    check(category, String);
    check(content, String);
    check(shopId, String);
    check(_id, String);
    // TODO check permissions for page

    const pageDetails = {
      pageTitle,
      slug,
      category,
      content,
      shopId
    };

    return StaticPages
      .update(_id,
      { $set: pageDetails });
  },
  /**
   * @param {String} _id Page ID
   * @return {Boolean} static page removal success
   */
  "staticPages/deletePage": function (_id) {
    check(_id, String);

    // TODO : check if has permission
    return StaticPages.remove(_id);
  }
});
