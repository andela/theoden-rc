import { Reaction } from "/client/api";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { StaticPages } from "/lib/collections";


Template.staticPagesList.onCreated(function () {
  Meteor.subscribe("staticPages");
});

Template.staticPagesList.events({
  "click button[name=edit-page]"(event) {
    event.stopPropagation();
    const _id = $(event.target).attr("data-id");

    const pageDetails = StaticPages.findOne(_id);
    $("#_id").val(pageDetails._id || "");
    // set values of fields
    $("#title").val(pageDetails.pageTitle);
    $("#category").val(pageDetails.category);

    Session.set("editorContent", pageDetails.content);
    const editPaageHTML = `<span class="edit-page-button float-left">
    Edit Page</span>
    <button class="btn btn-primary new-page-button float-right" name="new-page" id="new-page">
    New Page</button>`;
    $("#page-title").html(editPaageHTML);
    $("#submit").html("Edit Page");
  },
  "click button[name=delete-page]"(event) {
    event.stopPropagation();
    const _id = $(event.target).attr("data-id");
    Alerts.alert({
      title: "Delete Page",
      type: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      confirmButtonColor: "#d9534f",
      cancelButtonColor: "#98afbc"
    }).then(() => {
      Meteor.call("staticPages/deletePage", _id, (error, response) => {
        if (error) {
          return Alert.toast(error.message, "error", { autoHide: 3000 });
        } if (response) {
          return Alert
            .toast("Item Deleted Successfully", "Success",
            { autoHide: 3000 });
        }
        return 0;
      });
    }).catch(() => {
      return;
    });
  }
});
Template.staticPagesList.helpers({
  allStaticPages() {
    return StaticPages.find({ shopId: Reaction.shopId }).fetch();
  }
});
