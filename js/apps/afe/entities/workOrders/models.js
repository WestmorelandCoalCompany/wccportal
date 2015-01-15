/*
 * name: models.js
 * path: apps/afe/entities/workOrders/models.js
 * desc: JDE Work Orders & Descriptions returned from web service
 */

define([
    'backbone'
], function (Backbone) {
    var Models = {};

    Models.CapitalWorkOrder = Backbone.Model.extend({
        urlRoot: 'http://wccportal-test/-/_vti_bin/custom/data.svc/wos'
    });

    Models.CapitalWorkOrders = Backbone.Collection.extend({
        model: Models.CapitalWorkOrder,
        url: '_vti_bin/custom/data.svc/capitalwos',

        // options must include a data attribute with an operation, ledger
        // and year sub-attribute
        fetch: function(options) {
            options || (options = {});
            Backbone.Collection.prototype.fetch.call(this, options);
        }
    });

    return Models;
});