/*
 *  name: api
 *  path: apps/afe/entities/amounts/models
 *  desc: Justification amounts associated with a SharePoint project
 */

define([
    'apps/afe/entities/amounts/models',
    'marionette.m'
], function (Models, M) {
    var API = {},
        name = 'amounts';

    API.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

        // Channels
        channels: {
            api: {
                name: 'afe:api',
                events: {
                    reply: {
                        'amounts:get': 'get'
                    }
                }
            }
        },



        //  Initializers
        //  ------------

        init: function(options) {
            this.initCollection(name, Models.Amounts);
        },



        //  API Methods
        //  -----------

        // GET amounts
        get: function(options) {

        }
    });

    return API;
});