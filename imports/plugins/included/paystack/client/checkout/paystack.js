import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Random } from "meteor/random";
import {AutoForm} from "meteor/aldeed:autoform";
import { Cart } from "/lib/collections";
import { Paystack } from "../../lib/api";
import { PaystackPayment } from "../../lib/collections/schemas";
import "../../lib/api/paystackApi";
import "./paystack.html";


/**
 * @description: controls the display of inputs, complete-order button
 * and processing-button
 *
 * @param {template} the template to control
 * @param {buttonText} the text to display on complete-order button
 *
 * @return {void}
 */
const enableButton = (template, buttonText) => {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
};

/**
 * @description: controls the display of alert element on payment form
 *
 * @param {template} the template to control
 * @param {errorMessage} the error message to display
 *
 * @return {void}
 */
function paymentAlert(template, errorMessage) {
  $("#paystackPaymentForm").find(".alert").removeClass("hidden").text(
    errorMessage || "An error occurred. Kindldy check the details you entered");
}

/**
 * @description: controls the submit event on payment form
 *
 * @param {error} the error object from server
 *
 * @return {Function} paymentAlert function displaying the error message
 */
function handlePaystackSubmitError(error) {
  const serverError = error !== null ? error.message : void 0;
  if (serverError) {
    return paymentAlert("Oops! " + serverError);
  } else if (error) {
    return paymentAlert("Oops! " + error, null, 4);
  }
}

Template.paystackPaymentForm.helpers({
/**
 * @description: returns paystack payment schema
 *
 * @return {object} the paystack payment schema
 */
  PaystackPayment() {
    return PaystackPayment;
  }
});

/**
 * @description: generates paystackPaymentForm
 *
 * @param {string} id of the form to generate
 * @param {object} object containing attributes of the form
 *
 * @return {void}
 */
AutoForm.addHooks("paystack-payment-form", {
  onSubmit(doc) {
    Meteor.call("paystack/getKeys", (err, keys) => {
      const cart = Cart.findOne();
      const amount = Math.round(cart.cartTotal()) * 100;
      const template = this.template;
      const key = keys.public;
      const details = {
        key,
        name: doc.payerName,
        email: doc.payerEmail,
        reference: Random.id(),
        amount,
        callback(response) {
          const secret = keys.secret;
          const reference = response.reference;
          if (reference) {
            Paystack.verify(reference, secret, (error, res) => {
              if (error) {
                handlePaystackSubmitError(template, error);
                enableButton(template, "Resubmit payment");
              } else {
                const transaction = res.data;
                const paymentMethod = {
                  processor: "Paystack",
                  storedCard: transaction.authorization.card_type,
                  method: "Paystack Payment",
                  transactionId: transaction.reference,
                  currency: transaction.currency,
                  amount: transaction.amount / 100,
                  status: "passed",
                  mode: "authorize",
                  createdAt: new Date(),
                  transactions: []
                };
                Alerts.toast("Transaction successful");
                paymentMethod.transactions.push(transaction.authorization);
                Meteor.call("cart/submitPayment", paymentMethod);
              }
            });
          }
        },
        onClose() {
          enableButton(template, "Complete payment");
        }
      };
      try {
        PaystackPop.setup(details).openIframe();
      } catch (error) {
        handlePaystackSubmitError(template, error);
        enableButton(template, "Complete payment");
      }
    });
    return false;
  }
});
