import _ from "lodash";
import { Template } from "meteor/templating";
import { Orders } from "/lib/collections";
import { formatPriceString } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import $ from "jquery";

/**
 * Function to fetch the total of all sales made
 * @param {Array} allOrders - Array containing all the orders
 * @return {Object} - an Object containing the necessary overview details
 */
function getAnalytics(allOrders) {
  let totalSales = 0;
  let ordersCancelled = 0;
  let totalItemsPurchased = 0;
  let totalShippingCost = 0;
  const analytics = {};
  const analyticsStatement = {};
  const ordersAnalytics = [];

  allOrders.forEach((order) => {
    const orderDate = order.createdAt;
    const dateString = orderDate.toISOString().split("T")[0];
    if (order.workflow.status !== "canceled") {
      ordersAnalytics.push({
        date: dateString,
        country: order.billing[0].address.country,
        city: `${order.billing[0].address.city}, ${order.billing[0].address.region}`,
        paymentProcessor: order.billing[0].paymentMethod.processor,
        shipping: order.billing[0].invoice.shipping,
        taxes: order.billing[0].invoice.taxes
      });
      totalSales += order.billing[0].invoice.subtotal;
      totalItemsPurchased += order.items.length;
      totalShippingCost += order.billing[0].invoice.shipping;
      order.items.forEach((item) => {
        if (analytics[item.title]) {
          analytics[item.title].quantitySold += item.quantity;
          analytics[item.title].totalSales += item.variants.price * item.quantity;
        } else {
          analytics[item.title] = {
            quantitySold: item.quantity,
            totalSales: item.variants.price * item.quantity
          };
        }
        const uniqueStamp = `${dateString}::${item.title}`;
        if (analyticsStatement[uniqueStamp] && analyticsStatement[uniqueStamp].title === item.title) {
          analyticsStatement[uniqueStamp].totalSales += item.variants.price * item.quantity;
          analyticsStatement[uniqueStamp].quantity += item.quantity;
        } else {
          analyticsStatement[uniqueStamp] = {
            title: item.title,
            quantity: item.quantity,
            dateString,
            totalSales: item.variants.price * item.quantity
          };
        }
      });
    } else {
      ordersCancelled += 1;
    }
  });
  return { totalSales, totalItemsPurchased, totalShippingCost,
    analytics, analyticsStatement, ordersAnalytics, ordersCancelled };
}

/**
 * Helper function to calculate the differnce (in days)
 * between 2 dates
 * @param{Object} date1 - older date1 in milliseconds
 * @param{Object} date2 - recent date in milliseconds
 * @return{Number} - Difference between date2 and date1 in days (Number of days between date2 and date1)
 */
function daysDifference(date1, date2) {
  // a Day represented in milliseconds
  const oneDay = 86400000;
  // Calculate the difference in milliseconds
  const difference = new Date(new Date(date2).setHours(23)) - new Date(new Date(date1).setHours(0));
  // Convert back to days and return
  return Math.round(difference / oneDay);
}


/**
 * Helper method to set up the average sales total
 * @param{Number} totalSales - total sales
 * @param{Date} fromDate - start date
 * @param{toDate} toDate - end date
 * @return{Number} sales per day
 */
function getAverageSales(totalSales, fromDate, toDate) {
  const difference = daysDifference(Date.parse(fromDate), Date.parse(toDate));
  const salesPerDay = difference === 0 ? totalSales : totalSales / difference;
  return salesPerDay;
}

Template.analytics.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    tabTitle: "",
    ordersPlaced: 0,
    ordersData: [],
    beforeDate: new Date(),
    afterDate: new Date(),
    totalSales: 0,
    totalItemsPurchased: 0,
    ordersCancelled: 0,
    totalShippingCost: 0,
    salesPerDay: 0,
    analytics: {},
    analyticsStatement: {},
    ordersAnalytics: [],
    productsAnalytics: []
  });
  const self = this;
  self.autorun(() => {
    const orderSub = self.subscribe("Orders");
    if (orderSub.ready()) {
      const allOrders = Orders.find({
        createdAt: {
          $gte: new Date(self.state.get("beforeDate").setHours(0)),
          $lte: new Date(self.state.get("afterDate").setHours(23))
        }
      }).fetch();
      if (allOrders) {
        const analyticsItems = getAnalytics(allOrders);
        self.state.set("tabTitle", "Overview");
        self.state.set("ordersData", allOrders);
        self.state.set("ordersPlaced", allOrders.length);
        self.state.set("totalSales", analyticsItems.totalSales);
        self.state.set("totalItemsPurchased", analyticsItems.totalItemsPurchased);
        self.state.set("totalShippingCost", analyticsItems.totalShippingCost);
        self.state.set("analytics", analyticsItems.analytics);
        self.state.set("analyticsStatement", analyticsItems.analyticsStatement);
        self.state.set("ordersAnalytics", analyticsItems.ordersAnalytics);
        self.state.set("ordersCancelled", analyticsItems.ordersCancelled);
        self.state.set("salesPerDay",
          getAverageSales(self.state.get("totalSales"),
            self.state.get("beforeDate"),
            self.state.get("afterDate")));
      }
    }
  });
});

Template.analytics.onRendered(() => {
  const instance = Template.instance();
  let fromDatePicker = {};
  const toDatePicker = new Pikaday({ // eslint-disable-line no-undef
    field: $("#todatepicker")[0],
    format: "DD/MM/YYYY",
    onSelect() {
      const nextDate = this.getDate();
      instance.state.set("afterDate", nextDate);
    }
  });

  fromDatePicker = new Pikaday({ // eslint-disable-line no-undef
    field: $("#fromdatepicker")[0],
    format: "DD/MM/YYYY",
    onSelect() {
      toDatePicker.setMinDate(this.getDate());
      const nextDate = this.getDate();
      if (Date.parse(toDatePicker.getDate()) < Date.parse(nextDate)) {
        toDatePicker.setDate(nextDate);
      } else {
        instance.state.set("beforeDate", this.getDate());
      }
    }
  });
  fromDatePicker.setMaxDate(new Date());
  toDatePicker.setMaxDate(new Date());
  fromDatePicker.setDate(new Date());
  toDatePicker.setDate(fromDatePicker.getDate());
});

Template.analytics.events({
  "click .nav-tabs li": (event) => {
    const titles = {
      1: "Overview",
      2: "Daily Sales",
      3: "Order origin",
      4: "Most popular products",
      5: "Products by highest earnings",
      6: "Product performance guide"
    };

    const targetNum = event.target.hash[event.target.hash.length - 1];
    Template.instance().state.set("tabTitle", titles[targetNum]);
  }
});

Template.analytics.helpers({
  dateRange() {
    return {
      begin: Template.instance().state.get("beforeDate"),
      end: Template.instance().state.get("afterDate")
    };
  },
  tabTitle() {
    return Template.instance().state.get("tabTitle");
  },
  ordersPlaced() {
    const instance = Template.instance();
    const orders = instance.state.get("ordersPlaced");
    return orders - Template.instance().state.get("ordersCancelled");
  },
  totalSales() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("totalSales"));
  },
  totalItemsPurchased() {
    const instance = Template.instance();
    return instance.state.get("totalItemsPurchased");
  },
  totalShippingCost() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("totalShippingCost"));
  },
  salesPerDay() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("salesPerDay"));
  },
  bestSelling() {
    const products = [];
    const instance = Template.instance();
    const analytics = instance.state.get("analytics");
    Object.keys(analytics).forEach((key) => {
      products.push({
        product: key,
        quantitySold: analytics[key].quantitySold
      });
    });
    return _.orderBy(
      products,
      product => product.quantitySold,
      "desc"
    );
  },
  topEarning() {
    const products = [];
    const instance = Template.instance();
    const analytics = instance.state.get("analytics");
    Object.keys(analytics).forEach((key) => {
      products.push({
        product: key,
        salesSorter: analytics[key].totalSales,
        totalSales: formatPriceString(analytics[key].totalSales)
      });
    });
    return _.orderBy(
      products,
      product => product.salesSorter,
      "desc"
    );
  },
  statements() {
    const statements = [];
    const instance = Template.instance();
    const analyticsStatement = instance.state.get("analyticsStatement");

    Object.keys(analyticsStatement).forEach((key) => {
      statements.push(analyticsStatement[key]);
      analyticsStatement[key].totalSales =
        formatPriceString(analyticsStatement[key].totalSales);
    });
    return _.orderBy(
      statements,
      statement => Date.parse(statement.dateString),
      "desc"
    );
  },
  orders() {
    const instance = Template.instance();
    const orders = instance.state.get("ordersAnalytics");
    return _.orderBy(
      orders,
      (order) => {
        const currentOrder = order;
        currentOrder.taxes = formatPriceString(currentOrder.taxes);
        currentOrder.shipping = formatPriceString(currentOrder.shipping);
        return Date.parse(currentOrder.date);
      },
      "desc"
    );
  },
  allOrders() {
    const instance = Template.instance();
    const allOrders = instance.state.get("ordersData");
    return allOrders;
  },
  products() {
    const instance = Template.instance();
    const productsAnalytics = instance.state.get("productsAnalytics");
    return _.orderBy(productsAnalytics,
      product => product.views,
      "desc"
    );
  },
  ordersCancelled() {
    return Template.instance().state.get("ordersCancelled");
  }
});

const datesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = startDate;
  // use function declaration so as to preserve 'this' binding
  function addDays(days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

Template.salesChart.helpers({
  topGenresChart() {
    const allOrders = Template.instance().data.allOrders;
    const dateRange = Template.instance().data.dateRange;
    const allDates = datesBetween(dateRange.begin, dateRange.end)
      .map((date) => date.toDateString().split(" ").join("-"));
    const datesInOrders = [];
    const datesDetail = {};
    allOrders.map((order) => {
      const orderDate = order.createdAt.toDateString().split(" ").join("-");
      const price = order.billing[0].invoice.subtotal;
      if (datesInOrders.indexOf(orderDate) > -1) {
        datesDetail[orderDate].sales += price;
        datesDetail[orderDate].count += 1;
        datesDetail[orderDate].items += order.items.length;
      } else {
        datesInOrders.push(orderDate);
        datesDetail[orderDate] = { sales: price };
        datesDetail[orderDate].count = 1;
        datesDetail[orderDate].items = order.items.length;
      }
      return ({
        orderDate,
        price
      });
    });
    const setValue = (date, value) => {
      if (datesDetail.hasOwnProperty(date)) {
        return datesDetail[date][value];
      }
      return 0;
    };
    const salesArray = allDates.map(date => setValue(date, "sales"));
    const countArray = allDates.map(date => setValue(date, "count"));
    const itemsArray = allDates.map(date => setValue(date, "items"));

    return {
      chart: {
        zoomType: "xy"
      },
      title: {
        text: "Real time sales data at your finger tips"
      },
      xAxis: [{
        categories: allDates,
        crosshair: true
      }],
      yAxis: [{ // Primary yAxis
        labels: {
          format: "{value}",
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        title: {
          text: "Orders made",
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: true

      }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: "Sales",
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        labels: {
          format: "₦{value}",
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }

      }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
          text: "Items bought",
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        labels: {
          format: "{value}",
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        opposite: true
      }],
      tooltip: {
        shared: true
      },
      legend: {
        layout: "vertical",
        align: "left",
        x: 80,
        verticalAlign: "top",
        y: 35,
        floating: true,
        backgroundColor: (Highcharts.theme &&
          Highcharts.theme.legendBackgroundColor) || "#FFFFFF"
      },
      series: [{
        name: "Sales",
        type: "column",
        yAxis: 1,
        data: salesArray,
        tooltip: {
          valuePrefix: "₦"
        }

      }, {
        name: "Items Sold",
        type: "spline",
        yAxis: 2,
        data: itemsArray,
        marker: {
          enabled: false
        },
        dashStyle: "shortdot",
        tooltip: {
          valueSuffix: ""
        }

      }, {
        name: "Orders made",
        type: "spline",
        data: countArray,
        tooltip: {
          valueSuffix: ""
        }
      }]
    };
  }
});
