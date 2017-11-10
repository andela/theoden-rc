import Nexmo from "nexmo";
import dotenv from "dotenv";
dotenv.config();

/**
 * Sms class for sending messages
 */
class Sms {

  /**
   * 
   * @param {*} order 
   * @param {*} message 
   * @param {*} recipient 
   * @param {*} sender 
   */
  constructor(order, message = null, recipient = null, sender = null) {
    // create a nexmo instance with api keys
    this.nexmo = new Nexmo({apiKey: process.env.NEXMO_API_KEY, apiSecret: process.env.NEXMO_API_SECRET});
    if (sender === null) {
      this.sender = "THEODEN-RC";
    } else {
      this.sender = sender;
    }
    if (message === null) {
      this.message = `Hi ${order.billing[0].address.fullName}. 
      Your order (${order.items[0].productId}) 
      has been Successfully
      ${ (order.workflow.status === "refunded" || order.workflow.status === "canceled")
        ? "Canceled and Wallet Refunded"
        : "Confirmed and is being processed"}`;
    } else {
      this.message = message;
    }
    if (recipient === null) {
      this.recipient = `234${order
        .billing[0]
        .address
        .phone
        .slice(1)}`;
    } else {
      this.recipient = recipient;
    }
  }

  sendMessage() {
    return this.nexmo
    .message
    .sendSms(this.sender, this.recipient, this.message);
  }
}
export default Sms;
