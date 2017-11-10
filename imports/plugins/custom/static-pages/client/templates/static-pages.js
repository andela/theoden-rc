import { Reaction } from "/client/api";
import SimpleMDE from "simplemde";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";

import { Tracker } from "meteor/tracker";

import "/node_modules/simplemde/dist/simplemde.min.css";

/**
 *
 * @param {String} text
 * @return {String} slug
 */
// replace all none valid characters with -
const makeSlug = text =>
  text.toLowerCase().trim().replace(/[^A-z||0-9]/g, "-");


let editor = null;
Template.createStaticPages.onRendered(() => {
  editor = new SimpleMDE({
    element: document.getElementById("content"),
    placeholder: "Page Content Here",
    spellChecker: true,
    hideIcons: ["image"],
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true
    }
  });
});
const clearAll = () => {
  $("#_id").val("");
  $("#title").val("");
  $("#category").val("");
  editor.value("");
  $("#page-title").html("Create New Page");
  $("#submit").html("Create Page");
};
const clearEdit = () => {
  $("#title").val("");
  $("#category").val("");
  editor.value("");
};
Template.createStaticPages.events({
  "submit .page-form": (event) => {
    event.preventDefault();

    const _id = $("#_id").val();
    const pageTitle = $("#title").val();
    const slug = makeSlug(pageTitle);
    const content = $("#content").val();
    const category = $("#category").val() || "Pages";
    const shopId = Reaction.shopId;
    const owner = Meteor.user()._id;

    if (_id && _id !== null) {
      // edit page
      Meteor.call("staticPages/editPage", pageTitle,
        slug,
        category,
        content,
        shopId,
        _id, (error) => {
          if (error) {
            Alerts.toast(error.message, "error", { autoHide: 3000 });
          } else {
            Alerts.toast("Page Updated Successfully", "success",
              { autoHide: 3000 });
            clearAll();
          }
        }
      );
    } else {
      // edit page
      Meteor.call("staticPages/createPage", pageTitle,
        slug,
        category,
        content,
        shopId,
        owner, (error) => {
          if (error) {
            Alerts.toast(error.message, "error", { autoHide: 3000 });
          } else {
            Alerts.toast("Page Created Successfully", "success",
              { autoHide: 3000 });
            clearAll();
          }
        }
      );
    }
  },
  "click button[name=new-page]"(event) {
    event.stopPropagation();
    clearAll();
  },
  "click button[name=reset-form]"(event) {
    event.stopPropagation();
    clearEdit();
  }
});
Tracker.autorun(() => {
  const newContent = Session.get("editorContent");
  if (newContent) {
    editor.value(newContent);
  }
  Session.set("editorContent", undefined);
});

