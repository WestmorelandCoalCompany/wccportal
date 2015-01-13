define([
    'app',
], function (App) {
    App.module('Map.Controller', {
        define: function (MapController, App, Backbone, Marionette, $, _) {
            MapController.Controller = Marionette.Controller.extend({
                showMap: function (options) {
                    console.log('Initializing map...')
                }
            });

        }
    });

    return;
})