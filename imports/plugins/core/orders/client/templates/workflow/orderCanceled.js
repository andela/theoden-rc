import moment from "moment";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Shops } from "/lib/collections";
import { i18next } from "/client/api";

Template.coreOrderCanceledDisplay.onCreated(function () {
  const template = Template.instance();
  this.state = new ReactiveDict();

  // template.orderDep = new Tracker.Dependency;
  this.refunds = new ReactiveVar([]);
  this.refundAmount = new ReactiveVar(0.00);

  this.autorun(() => {
    const currentData = template.data;
    const order = currentData.order;
    const shop = Shops.findOne({});

    this.state.set("order", order);
    this.state.set("currency", shop.currencies[shop.currency]);
  });
});
Template.coreOrderCanceledDisplay.helpers({
  checkCanceledReason() {
    return this.order.reasons[0];
  },
  orderRefunded() {
    return !(this.order.refunded);
  },
  // checkPaymentCaptured() {
  //   if (this.order.billing[0].paymentMethod.status === "completed" ||
  //     this.order.billing[0].paymentMethod.status === "Completed" ||
  //     this.order.billing[0].paymentMethod.status === "passed" ||
  //     this.order.billing[0].paymentMethod.status === "Passed" ||
  //     this.order.billing[0].paymentMethod.status === "approved"
  //   ) {
  //     return true;
  //   }
  //   return false;
  // },
  orderAge() {
    return moment(this.order.reasons[0].updatedAt).fromNow();
  },
  shipmentStatus() {
    const order = this.order;
    const shipment = this.order.shipping[0];
    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return (_.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed") ||
                _.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/shipped")
              );
            }
          }
        }
      }
    });
    const instance = Template.instance();
    if (shipped) {
      instance.state.set("shipped", true);
      return {
        shipped: true,
        status: "success",
        label: i18next.t("orderShipping.itemsHaveBeenShipped")
      };
    }
    instance.state.set("shipped", false);
    return {
      shipped: false,
      status: "info",
      label: i18next.t("orderShipping.notShipped")
    };
  },
  shippmentRefundDetails() {
    const { state } = Template.instance();
    const order = state.get("order");
    // const status = order.billing[0].paymentMethod.status;
    const currencyFormat = state.get("currency");

    const shippingCost = order.billing[0].invoice.shipping;
    let totalRefundAmount = order.billing[0].invoice.total;
    const orderTotal = order.billing[0].invoice.total;
    const shipmentStatus = state.get("shipped");

    if (shipmentStatus) {
      totalRefundAmount -= shippingCost;
    }
    Template.instance().state.set("totalRefundAmount", totalRefundAmount);
    return {
      orderTotal,
      totalRefundAmount,
      shippingCost,
      currencyFormat
    };
  }
});
Template.coreOrderCanceledDisplay.events({
  "click button[name=approveCancel]": function (event, instance) {
    event.stopPropagation();
    const currency = instance.state.get("currency");
    const order = instance.state.get("order");
    const shipped = instance.state.get("shipped");
    const refundAmount = instance.state.get("totalRefundAmount");

    Alerts.alert({
      title: "Refund",
      text: `Refund ${currency.symbol}${refundAmount} to Buyer?`,
      showCancelButton: true,
      confirmButtonColor: "#228c22"
    }).then(() => {
      Meteor.call("order/approveCancel", order, shipped, (error) => {
        if (error) {
          Alerts.toast(("Failed!!", { err: error.message }), "error");
        } else {
          Alerts.alert({
            type: "success",
            showCancelButton: false,
            text: "Order Refund Successful"
          });
        }
      });
    }, () => { return; });
  }
});
