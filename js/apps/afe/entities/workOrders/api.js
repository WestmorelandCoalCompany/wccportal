/*
 *  name: api
 *  path: apps/afe/entities/workOrders/api
 *  desc: 
 */

define([
    'apps/afe/entities/workOrders/models',
    'marionette.m'
], function (Models, M) {
    var API = {},
        name = 'workOrders';

    API.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

        // Channels
        channels: {
            'api': {
                name: 'afe:api',
                events: {
                    reply: {
                        'workOrders:get': 'get'
                    }
                }
            }
        },



        //  Initializers
        //  ------------

        init: function(options) {
            this.initCollection(name, Models.CapitalWorkOrders);
        },



        //  API Methods
        //  -----------

        // GET capital work orders given an operation, year, and ledger
        get: function(options) {
            return this.getCollection(name, options);
        }
    });

    return API;
});