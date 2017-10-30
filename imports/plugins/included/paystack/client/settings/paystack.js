import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { PaystackPackageConfig } from "../../lib/collections/schemas";
import "./paystack.html";


/**
 * @description: returns paystack configurations
 *
 * @return {object} PaystackPackageConfig
 */
const PaystackPackageConfiguration = () => {
  return PaystackPackageConfig;
};

/**
 * @description: returns paystack data queried with shopId
 *
 * @return {object} Paystack data
 */
const packageData = () => {
  return Packages.findOne({
    name: "paystack",
    shopId: Reaction.getShopId()
  });
};

/**
 * @description: controls paystackSettings template on ./paystack.html
 *
 * @return(void)
 */
Template.paystackSettings.helpers({ PaystackPackageConfiguration, packageData });

/**
 * @description: controls paystack template on ./paystack.html
 *
 * @return(void)
 */
Template.paystack.helpers({ packageData });

/**
 * @description: controls click event on span element with data-event-action
 * showPaystackSettings
 *
 * @return(void)
 */
Template.paystack.events({
  "click [data-event-action=showPaystackSettings]": function () {
    Reaction.showActionView();
  }
});

/**
 * @description: generates paystackUpdateForm
 *
 * @param {object} object containing attributes of the form
 *
 * @return {void}
 */
AutoForm.hooks({
  "paystack-update-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Paystack Payment Method settings saved.", "success");
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("Paystack Payment Method settings update failed. " + error, "danger");
    }
  }
});
