import { Shops, Products, Orders, Cart, Inventory, Emails, Accounts } from "/lib/collections";
import Reaction  from "/server/api/core";

/** Function to check if a user has a specified role
 * @param {object} user:
 * @param {string} role:
 * @returns {boolean} if role exists for user
 */
const hasPermission = (user, role) => {
  return user.roles[Reaction.getShopId()]
    .includes(role);
};

/** Function to generate valid key names
 * to access swagger params
 * @param {string} collectionName:
 * @returns {string} corresponding swagger param key
 */
const paramKey = (collectionName) => {
  if (collectionName[collectionName.length - 1] === "s") {
    return `${collectionName.toLowerCase().slice(0, -1)}Id`;
  }
  return `${collectionName.toLowerCase()}Id`;
};

export default () => {
  // Global API configuration
  const Api = new Restivus({
    version: "v1",
    apiPath: "api/",
    useDefaultAuth: true,
    prettyJson: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  });

  Api.swagger = {
    meta: {
      swagger: "2.0",
      info: {
        version: "1.0.0",
        title: "Theoden-RC API",
        description: "Theoden Reaction Commerce API",
        termsOfService: "https://github.com/andela/theoden-rc",
        contact: {
          name: "The Theoden team"
        },
        license: {
          name: "MIT"
        }
      }
    },
    params: {
      // Parameter object definitions to be used in endpoint configurations
      // Path and body parameter types supported in v0.2.0
      shopId: {
        name: "id",
        in: "path",
        description: "shop ID",
        required: true,
        type: "string"
      },
      productId: {
        name: "id",
        in: "path",
        description: "Product ID",
        required: true,
        type: "string"
      },
      orderId: {
        name: "id",
        in: "path",
        description: "Orders ID",
        required: true,
        type: "string"
      },
      cartId: {
        name: "id",
        in: "path",
        description: "Cart ID",
        required: true,
        type: "string"
      },
      inventoryId: {
        name: "id",
        in: "path",
        description: "Inventory ID",
        required: true,
        type: "string"
      },
      emailId: {
        name: "id",
        in: "path",
        description: "Email ID",
        required: true,
        type: "string"
      },
      accountId: {
        name: "id",
        in: "path",
        description: "Account ID",
        required: true,
        type: "string"
      }
    }
  };

  const apiEndpoints = (collectionName) => {
    return {
      routeOptions: {
        authRequired: true
      },

      endpoints: {
        // GET all items in collection
        get: {
          swagger: {
            description: `Returns document in ${collectionName._name} collection`,
            parameters: [
              Api.swagger.params[paramKey(collectionName._name)]
            ],
            responses: {
              200: {
                description: "Success"
              }
            }
          },
          action() {
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "guest") ||
            hasPermission(this.user, "owner")) {
              const allRecords = collectionName.findOne(this.urlParams.id);
              if (!allRecords) {
                return { status: "fail",
                  message: "An error occurred. No such record" };
              }
              return {
                statusCode: 200,
                status: "success",
                data: allRecords
              };
            }
            return {
              statusCode: 403, status: "fail",
              message: "You do not have permission to view this record"
            };
          }
        },

        // POST into a collection
        post: {
          swagger: {
            description: `Creates document in ${collectionName._name} collection`,
            responses: {
              201: {
                description: "Success"
              }
            }
          },
          action() {
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner")) {
              const isInserted = collectionName.insert(this.bodyParams);
              if (isInserted) {
                return { statusCode: 201, status: "success", data: isInserted };
              }
              return {
                statusCode: 400, status: "fail",
                message: "An error occurred. Post was not successful"
              };
            }
            return {
              statusCode: 403, status: "fail",
              message: "You do not have permission to add a record"
            };
          }
        },

        // UPDATE a collection
        put: {
          swagger: {
            description: `Updates document ${collectionName._name} collection`,
            parameters: [
              Api.swagger.params[paramKey(collectionName._name)]
            ],
            responses: {
              201: {
                description: "Success"
              }
            }
          },
          action() {
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner")) {
              const isUpdated = collectionName.upsert({ _id: this.urlParams.id }, {
                $set: this.bodyParams
              });
              if (!isUpdated) {
                return { status: "fail", statusCode: 404,
                  message: "An error occurred. Record does not exist" };
              }
              const record = collectionName.findOne(this.urlParams.id);
              return { statusCode: 200, status: "success", data: isUpdated, record };
            }
            return {
              statusCode: 403, status: "fail",
              message: "You do not have permission to edit this record"
            };
          }
        },

        // DELETE a record in a collection
        delete: {
          swagger: {
            description: `Deletes document in ${collectionName._name} collection`,
            parameters: [
              Api.swagger.params[paramKey(collectionName._name)]
            ],
            responses: {
              204: {
                description: "Success"
              }
            }
          },
          action() {
            if (!hasPermission(this.user, "admin") && collectionName._name === "Accounts") {
              return {
                statusCode: 403, status: "fail",
                message: "You do not have permission to delete this record"
              };
            }
            if (hasPermission(this.user, "admin") ||
            hasPermission(this.user, "owner")) {
              // we delete a product by setting the isDeleted flag
              if (collectionName._name === "Products") {
                // get collection from db
                const collection = collectionName.findOne(this.urlParams.id);
                // modify isDeleted flag
                collection.isDeleted = true;
                // update collection in db
                const isDeleted = collectionName.upsert({ _id: this.urlParams.id }, {
                  $set: collection
                });
                return { data: isDeleted, message: "product has been archived" };
                // other collections may be removed
              }
              const isDeleted = collectionName.remove({ _id: this.urlParams.id });
              return { status: "success", data: isDeleted,  message: "record is deleted" };
            }
            return {
              statusCode: 403, status: "fail",
              message: "You do not have permission to delete this record"
            };
          }
        }
      }
    };
  };

  Api.addCollection(Meteor.users, {
    routeOptions: {
      authRequired: true
    },
    endpoints: {
      post: {
        authRequired: false
      }
    }
  });
  Api.addCollection(Shops, apiEndpoints(Shops));
  Api.addCollection(Products, apiEndpoints(Products));
  Api.addCollection(Orders, apiEndpoints(Orders));
  Api.addCollection(Cart, apiEndpoints(Cart));
  Api.addCollection(Inventory, apiEndpoints(Inventory));
  Api.addCollection(Emails, apiEndpoints(Emails));
  Api.addCollection(Accounts, apiEndpoints(Accounts));
  // Generates swagger.json to /api/v1/swagger.json
  Api.addSwagger("swagger.json");
};
