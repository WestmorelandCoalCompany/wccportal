define([
    'app',
    'apps/main/api',
    'apps/main/user/controller'
], function (App, API, User) {
    App.module('Main', {
        define: function (Main, App, Backbone, Marionette, $, _) {
            Main.Controller = M.Controller.extend({
                channels: {
                    channel: {
                        events: {
                            comply: {
                                'afe:init': 'afe',
                                'map:init': 'map',
                                'weekly:init': 'weekly'
                            }
                        }
                    }
                },

                // Initializers
                init: function (options) {
                    var api = this.controllers.get('api');
                    if (!api) {
                        api = new API.API();
                        this.controllers.add({name: 'api', controller: api});
                    }
                    this.api = api;
                    if (options.default) {
                        this.initNavigation();
                    }
                },

                onDestroy: function (options) {
                    delete this.api;
                },

                initNavigation: function () {
                    require(['apps/main/navigation/controller'], $.proxy(function (C) {
                        this.controllers.add({
                            name: 'mainMenu',
                            controller: new C.Controller({debug: App.debug})
                        });
                    }, this));
                },

                // Navigation Routes
                afe: function () {
                    require(['apps/afe/controller'], $.proxy(function (C) {
                        this.controllers.add({
                            name: 'app',
                            controller: new C.Controller({debug: App.debug})
                        })
                    }, this));
                },

                map: function () {
                    console.log('Initialize map here');
                },

                weekly: function () {
                    require(['apps/weekly/controller'], $.proxy(function (C) {
                        this.controllers.add({
                            name: 'app',
                            controller: new C.Controller({debug: App.debug})
                        })
                    }, this));
                }
            });
        }
    });

    return App.Main;
});