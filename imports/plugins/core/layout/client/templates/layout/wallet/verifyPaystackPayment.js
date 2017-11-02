import request from "request";

/**
 * @description: sets secretKey in the request headers
 *
 * @param {string} secret: value to set in headers
 *
 * @return {object} headers object
 */
const paystackHeaders = (secret) => {
  return {
    "Authorization": `Bearer ${secret}`,
    "Content-Type": "application/json"
  };
};

/**
 * @description: consumes an API to verifies the validity of
 * transaction with the generated referenceId
 *
 * @param {object} reference: a stringified paystack reference
 * object containing referenceId
 * @param {string} secret: the secretKey given from paystack
 * @param {function} cb: callback function
 *
 * @return {object} headers object
 */
verifyPaystackPayment = (reference, secret, cb) => {
  const referenceId = JSON.parse(reference).reference;
  const headers = paystackHeaders(secret);
  const url = `https://api.paystack.co/transaction/verify/${referenceId}`;
  request.get(url, { headers }, (err, response, body) =>  {
    const res = JSON.parse(body);
    if (res.status) {
      cb(null, res);
    } else {
      cb(res, null);
    }
  });
};

export default verifyPaystackPayment;
