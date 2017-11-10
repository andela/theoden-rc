import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Static Pages",
  name: "reaction-static-pages",
  icon: "fa fa-paragraph",
  autoEnable: true,
  settings: {
    name: "Static Pages"
  },
  registry: [
    {
      provides: "dashboard",
      container: "core",
      route: "/dashboard/static",
      name: "static-pages",
      label: "Static Pages",
      description: "Create/Edit/Delete Static Page",
      icon: "fa fa-paragraph",
      priority: 1,
      workflow: "coreProductWorkflow",
      template: "createStaticPages"
    }
  ],
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "StaticPages",
    theme: "default",
    enabled: true,
    structure: {
      template: "createStaticPages",
      layoutHeader: "layoutHeader",
      layoutFooter: "layoutFooter",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "dashboardControls",
      dashboardHeaderControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
