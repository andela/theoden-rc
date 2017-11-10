import introJs from "intro.js";
import { Reaction } from "/client/api";

const tour = introJs.introJs();
const userTour = [
  {
    intro: `<h2>Welcome to <strong>Theoden RC!</strong></h2>
    <hr>
    <div class="tourcontainer">
     This brief tour would introduce you to the important controls to help you navigate and effectively
         use our platform
    </div>`
  },
  {
    element: ".product-grid-list",
    intro: `<h2>Available Products</h2>
    <hr>
    <div>
      All available products would be displayed here. You can browse through, click on your desired product, then proceed to add it to your cart
    </div>`
  },
  {
    element: ".search",
    intro: `<h2>Product Search</h2>
    <hr>
    <div class="tourcontainer">
      You can easily find a product with our intuitive search system here.
    </div>`
  },
  {
    element: ".cart",
    intro: `<h2>Shopping Cart</h2>
    <hr>
    <div class="tourcontainer">
    You cart shows you the amount of items you have selected for purchase.
    Click on the cart icon to check out.
    </div>`
  },
  {
    element: ".accounts",
    intro: `<h2>Account Options</h2>
    <hr>
    <div class="tourcontainer">
      You can access account related options here.
      Registration, signin, profile, wallet and signout here.
    </div>`
  },
  {
    element: ".languages",
    intro: `<h2>Language Support</h2>
    <hr>
    <div class="tourcontainer">
      Language should never be a barrier.
      Click here to select your preferred language.
    </div>`
  },
  {
    element: ".helplink",
    intro: `<h2>Help</h2>
    <hr>
    <div class="tourcontainer">
      If you need a detailed guide, you can access our help links here.
    </div>`
  },
  {
    element: ".brand",
    intro: `<h2>Our shop</h2>
    <hr>
    <div class="tourcontainer">
      you can use this link, if you ever need to get back to the products page.
    </div>`
  },
  {
    element: "#tour-button",
    intro: `<h2>Tour</h2>
    <hr>
    <div class="tourcontainer">
      Thanks for joining me in the tour. Ever need to take a tour again, I am right here.
    </div>`
  }
];
const vendorTour = [
  {
    intro: `<h2>Welcome to <strong>Theoden RC!</strong></h2>
    <hr>
    <div class="tourcontainer">
     This brief tour would introduce you to the important controls to help you navigate and effectively use our platform
    </div>`
  },
  {
    element: ".admin-controls-menu",
    intro: `<h2>Admin Controls</h2>
    <hr>
    <div class="tourcontainer">
      This tab gives you access to Admin functionalities such as your dashboard, accounts and content creation
    </div>`
  },
  {
    element: ".product-grid-list",
    intro: `<h2>Products</h2>
    <hr>
    <div>
      All products added would be displayed here.<br>
      You can browse through, click on your desired product, then proceed to add it to your cart
    </div>`
  },
  {
    element: ".search",
    intro: `<h2>Product Search</h2>
    <hr>
    <div class="tourcontainer">
      You can easily find a product, order or customer account with our intuitive search system here.
    </div>`
  },
  {
    element: ".cart",
    intro: `<h2>Shopping Cart</h2>
    <hr>
    <div class="tourcontainer">
    You cart shows you the amount of items you have selected for purchase.
    Click on the cart icon to check out.
    </div>`
  },
  {
    element: ".accounts",
    intro: `<h2>Account Options</h2>
    <hr>
    <div class="tourcontainer">
      You can access account related options here.
      Registration, signin, profile, wallet and signout here.
    </div>`
  },
  {
    element: ".languages",
    intro: `<h2>Language Support</h2>
    <hr>
    <div class="tourcontainer">
      Language should never be a barrier.
      Click here to select your preferred language.
    </div>`
  },
  {
    element: ".helplink",
    intro: `<h2>Help</h2>
    <hr>
    <div class="tourcontainer">
      If you need a detailed guide, you can access our help links here.
    </div>`
  },
  {
    element: ".static-pages",
    intro: `<h2>Static Pages</h2>
    <hr>
    <div class="tourcontainer">
      Gives you the ability to create static pages
    </div>`
  },
  {
    element: ".brand",
    intro: `<h2>Our shop</h2>
    <hr>
    <div class="tourcontainer">
      you can use this link, if you ever need to get back to the products page.
    </div>`
  },
  {
    element: ".tour",
    intro: `<h2>Tour</h2>
    <hr>
    <div class="tourcontainer">
      Thanks for joining me in the tour. Ever need to take a tour again, I am right here.
    </div>`
  }
];

export function introTour() {
  let tourSteps;
  if (Reaction.hasPermission("admin")) {
    tourSteps = vendorTour;
  } else {
    tourSteps = userTour;
  }
  tour.setOptions({
    showBullets: true,
    showProgress: true,
    scrollToElement: true,
    showStepNumbers: false,
    tooltipPosition: "auto",
    steps: tourSteps
  });
  tour.start();
}
