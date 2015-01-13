define([
    'app',
    'apps/main/entities/ledgers/models'
], function (App, Models) {
    App.module('Main.Entities.Ledgers.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'api': {
                        name: 'main:api',
                        events: {
                            reply: {
                                'ledgers:get': 'get'
                            }
                        }
                    }
                },



                //  Initializers
                //  ------------

                init: function(options) {
                    this.initCollection('ledgers', Models.Ledgers);
                },



                //  API Methods
                //  -----------

                // GET ledgers
                get: function(options) {
                    return this.getCollection('ledgers', options);
                }
            });
        }
    });

    return App.Main.Entities.Ledgers.API;
});