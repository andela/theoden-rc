import { Reaction } from "/client/api";
import { Template } from "meteor/templating";
import { StaticPages } from "/lib/collections";

Template.theodenfooter.onCreated(function () {
  this.autorun(() => {
    this.subscribe("staticPages");
  });
});
Template.theodenfooter.helpers({
  categoryHeader(category) {
    return category[0].category || "Pages";
  },
  staticPagesCategory() {
    const staticPagesList = StaticPages.find({
      shopId: Reaction.shopId
    }).fetch();


    const pageCategories = [];

    staticPagesList.forEach(page => {
      if (!pageCategories.includes(page.category)) {
        pageCategories.push(page.category);
      }
    });
    return pageCategories
      .map(category =>
        staticPagesList
          .filter(page => page.category === category
          ));
  }
});
