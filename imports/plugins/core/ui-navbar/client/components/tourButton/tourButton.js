import { introTour } from "/imports/plugins/included/tour/introTour";
import { Template } from "meteor/templating";

Template.tourButton.events({
  "click #tour-button": () => {
    introTour();
  }
});
