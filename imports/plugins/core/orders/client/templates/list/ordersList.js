import moment from "moment";
import { Template } from "meteor/templating";
import { Orders, Shops } from "/lib/collections";

/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
  orderStatus() {
    if (this.workflow.status === "coreOrderCompleted" ||
      this.workflow.status === "coreOrderWorkflow/completed") {
      return true;
    }
    return false;
  },
  orders(data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    return Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
  },
  orderAge() {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking() {
    return this.shipping[0].shipmentMethod.tracking;
  },
  shopName() {
    const shop = Shops.findOne(this.shopId);
    return shop !== null ? shop.name : void 0;
  }, orderCancelled() {
    if (this.workflow.status === "canceled" ||
      this.workflow.status === "refunded") {
      return true;
    }
    return false;
  },
  cancelOrderButton() {
    if (this.workflow.status !== "coreOrderWorkflow/completed" &&
      this.workflow.status !== "canceled" &&
      this.workflow.status !== "coreOrderCompleted" &&
      this.workflow.status !== "coreOrderWorkflow/canceled" &&
      this.workflow.status !== "coreOrderWorkflow/refunded"
    ) {
      return true;
    }
    return false;
  }
});
Template.dashboardOrdersList.events({
  "click button[name=cancelOrder]": function (event) {
    event.stopPropagation();
    const orderDetail = this;

    Alerts.alert({
      title: "Cancel Order",
      showCancelButton: true,
      input: "select",
      type: "warning",
      confirmButtonColor: "#d9534f",
      cancelButtonColor: "#98afbc",
      inputPlaceholder: "Select from dropdown",
      confirmButtonText: "Cancel Order",
      inputOptions: {
        "No Longer Interested": "No Longer Interested",
        "Duplicate Order": "Duplicate Order",
        "Item Taking too Long To Deliver": "Item Taking too Long To Deliver",
        "Others": "Others, Specify"
      },
      inputValidator: function (result) {
        return new Promise((resolve, reject) => {
          if (result) {
            inputValue = result;
            resolve(result);
          } else {
            reject("Kindly Select an Option");
          }
        });
      }
    }).then(() => {
      if (inputValue === "Others") {
        let otherReason = null;
        Alerts.alert({
          title: "Enter Reason Below",
          input: "text",
          showCancelButton: true,
          confirmButtonColor: "#228c22",
          preConfirm: function (reasonText) {
            return new Promise((resolve, reject) => {
              if (reasonText) {
                otherReason = reasonText;
                resolve();
              } else {
                reject("Please Kindly Type in Reason Below");
              }
            });
          }
        }).then(() =>
          Meteor.call("orders/cancelOrder", orderDetail, otherReason)
          );
      } else {
        Meteor.call("orders/cancelOrder", orderDetail, inputValue);
        return 0;
      }
      return 0;
    });
  }
});
