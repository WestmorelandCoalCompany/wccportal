define([
    'app',
    'apps/main/entities/api'
], function (App, Entities) {
    App.module('Main', {
        define: function (Main, App, Backbone, Marionette, $, _) {
            Main.Controller = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'channel': {
                        events: {
                            on: {
                                'afe': 'afe',
                                'weekly': 'weekly'
                            }
                        }
                    }
                },



                //  Initializers
                //  ------------

                init: function(options) {
                    options || (options = {});
                    _.each(this.initializers, function(method, name) {
                        if (name != 'navigation') {
                            method.call(this);
                        }
                        else {
                            if (options.default) method.call(this);
                        }
                    }, this);
                },

                // initializers
                initializers: {
                    // start main api's
                    api: function() {
                        this.initController('api', Entities.API);
                    },

                    // initialize the main navigation
                    navigation: function() {
                        this.requireController('navigation', 'apps/main/navigation/controller');
                    }
                },



                //  Route Handlers
                //  --------------

                afe: function() {
                    this.requireController('app', 'apps/afe/controller');
                },

                map: function() {

                },

                weekly: function() {
                    this.requireController('app', 'apps/weekly/controller');
                },



                //  Internal Methods
                //  ----------------

                // initialize a new app controller
                requireController: function(name, path, options, objOptions) {
                    options || (options = {});
                    objOptions || (objOptions = {});
                    _.extend(objOptions, {debug: App.debug});
                    require([path], _.bind(function(C) {
                        this.initController(name, C.Controller, options, objOptions);
                    }, this));
                }
            });
        }
    });

    return App.Main;
});