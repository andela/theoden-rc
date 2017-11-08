import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Stats",
  name: "Stats",
  icon: "fa fa-bar-chart",
  autoEnable: true,
  settings: {
    name: "Stats"
  },
  registry: [
    {
      route: "/dashboard/analytics",
      provides: "dashboard",
      name: "Stats",
      label: "Stats",
      description: "View Stats",
      icon: "fa fa-bar-chart",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow",
      template: "analytics"
    }
  ]
});
