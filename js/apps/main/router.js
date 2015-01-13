define([
    'app',
], function (App) {
    App.module('Main.Router', {
        define: function (Router, App, Backbone, Marionette, $, _) {
            // Router
            Router.Router = Marionette.AppRouter.extend({
                appRoutes: {
                    // AFE
                    'afe*path': 'afe',
                    'map*path': 'map',
                    'weekly*path': 'weekly'
                }
            });
        }
    });

    return App.Main.Router;
});