import { StaticPages } from "/lib/collections";
import { Template } from "meteor/templating";
import marked from "marked";

Template.staticPageDisplay.onCreated(function () {
  this.autorun(() => {
    Meteor.subscribe("staticPages");
  });
});
Template.staticPageDisplay.helpers({
  staticPage(slug) {
    if (Template.instance().subscriptionsReady()) {
      const staticPage = StaticPages.findOne({ slug });
      if (staticPage) {
        const data = staticPage;
        data.content = marked(data.content);
        return [data];
      }
    }
    return false;
  }
});
