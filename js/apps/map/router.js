define([
    'app'
], function (App) {
    App.module('Map.Router', {
        define: function (Router, App, Backbone, Marionette, $, _) {
            Router.Router = Marionette.AppRouter.extend({
                appRoutes: {
                    'map(/filter/criterion::criterion)': 'initMap'
                }
            });
        }
    });

    return;
});