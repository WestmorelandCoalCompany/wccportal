/*
 *  name: models
 *  path: apps/afe/entities/amounts/models
 *  desc: SharePoint project amounts
 */

define([
    'backbone',
    'backbone.sp'
], function (Backbone) {
    var Models = {};

    Models.Amount = Backbone.SP.Item.extend({
        site: '/',
        list: 'Capital Amounts',

        defaults: {
            __metadata: {
                type: "SP.Data.Capital_x0020_AmountsListItem",
                Submitted: false
            }
        },

        parse: function(res, options) {
            if (options.deleted || options.updated) return this.attributes;

            _.each(['Date', 'Modified', 'Created'], function(attr) {
                if (res[attr]) {
                    res[attr] = new Date(res[attr]);
                }
            });

            return res;
        }
    });

    Models.Amounts = Backbone.SP.List.extend({
        model: Models.Amount,
        fetch: function (options) {
            options || (options = {});
            $.extend(options, {
                select: '*'
            });
            Backbone.Collection.prototype.fetch.call(this, options);
        },
        getTotalByYear: function(year) {
            return _.reduce(this.map(function(model) {
                if (model.get('Date').getFullYear() == year) return model.get('Amount');
                return 0;
            }), function(memo, val) {
                if (val) memo += val;
                return memo;
            }, 0);
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