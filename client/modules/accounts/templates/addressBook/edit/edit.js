import { i18next } from "/client/api";
import { Meteor } from "meteor/meteor";

/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */

AutoForm.hooks({
  addressBookEditForm: {
    beginSubmit: function () {
      this.removeStickyValidationError("phone");
    },
    onSubmit: function (insertDoc) {
      this.event.preventDefault();

      const addressBook = $(this.template.firstNode).closest(".address-book");
      const phoneCheck = new RegExp("[^0-9+\(\)#\.\s\-]");
      if (phoneCheck.test(insertDoc.phone)) {
        this.addStickyValidationError("phone", "invalidPhone");
        return false;
      }
      Meteor.call("accounts/addressBookUpdate", insertDoc, (error, result) => {
        if (error) {
          Alerts.toast(i18next.t("addressBookEdit.somethingWentWrong", { err: error.message }), "error");
          this.done(new Error(error));
          return false;
        }
        if (result) {
          this.done();

          // Show the grid
          addressBook.trigger($.Event("showMainView"));
        }
      });
    }
  }
});
