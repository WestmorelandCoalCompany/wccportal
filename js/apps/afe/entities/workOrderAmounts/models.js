/*
 *  name: models
 *  path: apps/afe/entities/workOrderAmounts/models.js
 *  desc: Capital work order amounts for a specific work order and ledger
 */

define([
    'backbone'
], function (Backbone) {
    var Models = {};

    Models.CapitalWorkOrderAmount = Backbone.Model.extend({
        urlRoot: 'http://wccportal-test/-/_vti_bin/custom/data.svc/capitalwoamounts',
        defaults: {
            Amount_Type: 'Variance',
            Amount: null
        },
        parse: function(res, options) {
            options || (options = {});
            if (options.deleted) return this.attributes;
            if (res.Date) res.Date = new Date(res.Date);
            return res;
        }
    });

    Models.CapitalWorkOrderAmounts = Backbone.Collection.extend({
        model: Models.CapitalWorkOrderAmount,
        url: '_vti_bin/custom/data.svc/capitalwoamounts',

        // options must include a data attribute with an operation, ledger, year
        // and workOrder(integer) sub-attribute
        fetch: function(options) {
            options || (options = {});
            Backbone.Collection.prototype.fetch.call(this, options);
        },
        getTotalByWhere: function(attrs) {
            return _.reduce(_.map(this.where(attrs), function(model) {return model.get('Amount')}), function(memo, val) {
                if (val) memo += val;
                return memo;
            }, 0);
        }
    });

    return Models;
});