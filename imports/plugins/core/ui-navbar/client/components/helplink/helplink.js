import { Template } from "meteor/templating";

/**
 * i18nChooser events
 */

Template.helplink.events({
  "click .help-item": function (event) {
    event.preventDefault();
    FlowRouter.go("/help");
  }
});

