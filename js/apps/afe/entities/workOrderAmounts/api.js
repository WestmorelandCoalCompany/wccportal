/*
 *  name: api
 *  path: apps/afe/entities/workOrderAmounts
 *  desc: 
 */

define([
    'apps/afe/entities/workOrderAmounts/models',
    'marionette.m'
], function (Models, M) {
    var API = {},
        name = 'workOrderAmounts';

    API.Controller = M.Controller.extend({
        channels: {
            api: {
                name: 'afe:api',
                events: {
                    reply: {
                        'workOrderAmounts:get': 'get'
                    }
                }
            }
        },

        init: function(options) {
            this.initCollection(name, Models.CapitalWorkOrderAmounts);
        },

        // GET capital work order amounts given an operation, year, ledger, and
        // work order number as integer
        get: function(options) {
            return this.getCollection(name, options);
        }
    });

    return API;
});