import { Template } from "meteor/templating";

Template.noSearchItem.helpers({
  noSearchResults(searchQuery, products) {
    if (searchQuery.length > 2 && products.length < 1) {
      return true;
    }
    return false;
  }
});
