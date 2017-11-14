import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import _ from "underscore";

  // // counter starts at 0
  // Session.setDefault("counter", 0);

// slider starts at 20 and 80
Session.setDefault("slider", [0, 200000]);

let sliderObj;
Template.productSortOptions.rendered = () => {
  sliderObj = this.$("#slider").noUiSlider({
    start: Session.get("slider"),
    connect: true,
    range: {
      min: 0,
      max: 200000
    }
  }).on("slide", (event, value) =>{
    // set rounded off values on 'slide' event
    Session.set("slider", [Math.round(value[0]), Math.round(value[1])]);
  }).on("change", function (event, value) {
      // round off values on 'change' event
    Session.set("slider", [Math.round(value[0]), Math.round(value[1])]);
  });
};
Template.productSortOptions.events({
  "change #sort": (event) => {
    Session.set("sortValue", event.target.value);
  },
  "change #vendor-filter": (event) => {
    Session.set("sortVendorValue", event.target.value);
  },
  "keyup #price-filter1": (event) => {
    if (event.target.value <= Session.get("slider")[1]) {
      Session.set("slider", [event.target.value, Session.get("slider")[1]]);
    } else {
      Session.set("slider", [Session.get("slider")[1], Session.get("slider")[1]]);
    }
    Session.set("sortPriceValue1", event.target.value);
    sliderObj.val(Session.get("slider"));
  },
  "keyup #price-filter2": (event) => {
    if (event.target.value >= Session.get("slider")[0]) {
      Session.set("slider", [Session.get("slider")[0], event.target.value]);
    } else {
      Session.set("slider", [Session.get("slider")[0], Session.get("slider")[0]]);
    }
    Session.set("sortPriceValue2", event.target.value);
    sliderObj.val(Session.get("slider"));
  }
});

Template.productSortOptions.helpers({
  getVendors(products) {
    return _.uniq(_.pluck(products, "vendor"));
  },
  sliderMin() {
    const sliderMinValue = Session.get("slider")[0];
    Session.set("sortPriceValue1", sliderMinValue);
    return sliderMinValue;
  },
  sliderMax() {
    const sliderMaxValue = Session.get("slider")[1];
    Session.set("sortPriceValue2", sliderMaxValue);
    return sliderMaxValue;
  }
});

