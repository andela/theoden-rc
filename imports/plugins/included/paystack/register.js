import { Reaction } from "/server/api";

/*
 * @description: registers paystack on the app for
 * display, and configuration by admin
 *
 * @return(void)
 */
Reaction.registerPackage({
  label: "Paystack",
  name: "paystack",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
  settings: {
    mode: false,
    publicKey: "",
    secretKey: ""
  },
  registry: [
    {
      provides: "dashboard",
      label: "Paystack",
      description: "Paystack payment provider",
      icon: "fa fa-credit-card-alt",
      priority: 3,
      container: "paymentMethod"
    },

    {
      label: "Paystack Payment Settings",
      route: "/dashboard/paystack",
      provides: "settings",
      container: "dashboard",
      template: "paystackSettings"
    },

    {
      template: "paystackPaymentForm",
      provides: "paymentMethod"
    }
  ]
});
