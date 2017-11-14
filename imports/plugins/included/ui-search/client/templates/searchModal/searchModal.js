import _ from "lodash";
import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { ProductSearch, Tags, OrderSearch, AccountSearch, Products } from "/lib/collections";
import { IconButton, SortableTable } from "/imports/plugins/core/ui/client/components";

/*
 * searchModal extra functions
 */
function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}

/*
 * searchModal onCreated
 */
Template.searchModal.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    productSearchResults: [],
    tagSearchResults: [],
    allProducts: [],
    isProductSearch: ""
  });

  // Sort products by price
  const sortSearch = (products, type) => {
    switch (type) {
      case "lowest":
        return products.sort((product1, product2) => {
          const firstProduct = product1.price === null ? -1 : product1.price.min;
          const secondProduct = product2.price === null ? -1 : product2.price.min;
          return firstProduct - secondProduct;
        });
      case "highest":
        return products.sort((product1, product2) => {
          const firstProduct = product1.price === null ? -1 : product1.price.min;
          const secondProduct = product2.price === null ? -1 : product2.price.min;
          return secondProduct - firstProduct;
        });
      case "newest":
        return products.reverse();
      case "oldest":
        return products;
      default:
        break;
    }
  };

  // Filter products by vendor
  const filterByVendor = (products, query) => {
    return _.filter(products, (product) => {
      return product.vendor === query;
    });
  };

  // filter search by price range
  const filterByPrice = (products, price1, price2) => {
    return _.filter(products, (product) => {
      if (product.price) {
        const maxPrice = parseFloat(product.price.max);
        const minPrice = parseFloat(product.price.min);
        const queryMaxPrice = parseFloat(price2);
        const queryMinPrice = parseFloat(price1);
        if ((minPrice >= queryMinPrice && minPrice <= queryMaxPrice)
        || (maxPrice >= queryMinPrice && maxPrice <= queryMaxPrice)) {
          return product;
        }
        return false;
      }
    });
  };
  // Allow modal to be closed by clicking ESC
  // Must be done in Template.searchModal.onCreated and not in Template.searchModal.events
  $(document).on("keyup", (event) => {
    if (event.keyCode === 27) {
      const view = this.view;
      $(".js-search-modal").fadeOut(400, () => {
        $("body").css("overflow", "visible");
        Blaze.remove(view);
      });
    }
  });


  this.autorun(() => {
    const searchCollection = this.state.get("searchCollection") || "products";
    const searchQuery = this.state.get("searchQuery");
    const facets = this.state.get("facets") || [];
    const sub = this.subscribe("SearchResults", searchCollection, searchQuery, facets);
    const sortOptions = Session.get("sortValue");
    const vendorFilter = Session.get("sortVendorValue");
    const priceFilter1 = Session.get("sortPriceValue1");
    const priceFilter2 = Session.get("sortPriceValue2");


    if (sub.ready()) {
      /*
       * Product Search
       */
      if (searchCollection === "products") {
        let productResults = ProductSearch.find().fetch();
        if (!["null", "all"].includes(sortOptions) && sortOptions) {
          productResults = sortSearch(productResults, sortOptions);
        }

        if (!["null", "all"].includes(vendorFilter) && vendorFilter) {
          productResults = filterByVendor(productResults, vendorFilter);
        }

        if ((!["null", "all"].includes(priceFilter1) && priceFilter1) || (!["null", "all"].includes(priceFilter2) && priceFilter2)) {
          productResults = filterByPrice(productResults, priceFilter1, priceFilter2);
        }

        const allProducts = Products.find().fetch();
        this.state.set("allProducts", allProducts);

        const productResultsCount = productResults.length;
        this.state.set("productSearchResults", productResults);
        this.state.set("productSearchCount", productResultsCount);
        this.state.set("isProductSearch", true);

        const hashtags = [];
        for (const product of productResults) {
          if (product.hashtags) {
            for (const hashtag of product.hashtags) {
              if (!_.includes(hashtags, hashtag)) {
                hashtags.push(hashtag);
              }
            }
          }
        }
        const tagResults = Tags.find({
          _id: { $in: hashtags }
        }).fetch();
        this.state.set("tagSearchResults", tagResults);

        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("orderSearchResults", "");
      }

      /*
       * Account Search
       */
      if (searchCollection === "accounts") {
        const accountResults = AccountSearch.find().fetch();
        const accountResultsCount = accountResults.length;
        this.state.set("accountSearchResults", accountResults);
        this.state.set("accountSearchCount", accountResultsCount);
        this.state.set("isProductSearch", false);
        // TODO: Do we need this?
        this.state.set("orderSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }

      /*
       * Order Search
       */
      if (searchCollection === "orders") {
        const orderResults = OrderSearch.find().fetch();
        const orderResultsCount = orderResults.length;
        this.state.set("orderSearchResults", orderResults);
        this.state.set("orderSearchCount", orderResultsCount);
        this.state.set("isProductSearch", false);


        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }
    }
  });
});


/*
 * searchModal helpers
 */
Template.searchModal.helpers({
  IconButtonComponent() {
    const instance = Template.instance();
    const view = instance.view;

    return {
      component: IconButton,
      icon: "fa fa-times",
      kind: "close",
      onClick() {
        $(".js-search-modal").fadeOut(400, () => {
          $("body").css("overflow", "visible");
          Blaze.remove(view);
        });
      }
    };
  },
  productSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("productSearchResults");
    return results;
  },
  tagSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("tagSearchResults");
    return results;
  },
  showSearchResults() {
    return false;
  },
  allProducts() {
    const instance = Template.instance();
    const results = instance.state.get("allProducts");
    return results;
  },
  searchQuery() {
    const instance = Template.instance();
    const results = instance.state.get("searchQuery");
    return results;
  },
  isProductSearch() {
    const instance = Template.instance();
    const results = instance.state.get("isProductSearch");
    return results;
  }
});


/*
 * searchModal events
 */
Template.searchModal.events({
  // on type, reload Reaction.SaerchResults
  "keyup input": (event, templateInstance) => {
    event.preventDefault();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
    $(".search-modal-header:not(.active-search)").addClass(".active-search");
    if (!$(".search-modal-header").hasClass("active-search")) {
      $(".search-modal-header").addClass("active-search");
    }
  },
  "click [data-event-action=filter]": function (event, templateInstance) {
    event.preventDefault();
    const instance = Template.instance();
    const facets = instance.state.get("facets") || [];
    const newFacet = $(event.target).data("event-value");

    tagToggle(facets, newFacet);

    $(event.target).toggleClass("active-tag btn-active");

    templateInstance.state.set("facets", facets);
  },
  "click [data-event-action=productClick]": function () {
    const instance = Template.instance();
    const view = instance.view;
    $(".js-search-modal").delay(400).fadeOut(400, () => {
      Blaze.remove(view);
    });
  },
  "click [data-event-action=clearSearch]": function (event, templateInstance) {
    $("#search-input").val("");
    $("#search-input").focus();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
  },
  "click [data-event-action=searchCollection]": function (event, templateInstance) {
    event.preventDefault();
    const searchCollection = $(event.target).data("event-value");

    $(".search-type-option").not(event.target).removeClass("search-type-active");
    $(event.target).addClass("search-type-active");
    $("#search-input").focus();

    templateInstance.state.set("searchCollection", searchCollection);
  }
});


/*
 * searchModal onDestroyed
 */
Template.searchModal.onDestroyed(() => {
  // Kill Allow modal to be closed by clicking ESC, which was initiated in Template.searchModal.onCreated
  $(document).off("keyup");
});
