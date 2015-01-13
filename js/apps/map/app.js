define([
    'app',
], function (App) {
    App.module('Map', {
        define: function (Map, App, Backbone, Marionette, $, _) {

        },
        onStart: function (options) {
            console.log('App.Map: Starting');
        },
        onStop: function() {
            console.log('App.Map: Stopping');
        }
    });
    App.module('Map.Router', {
        define: function (Map, App, Backbone, Marionette, $, _) {
            // Router
            Map.Router = Marionette.AppRouter.extend({
                appRoutes: {
                    'map(/filter/criterion::criterion)': 'showMap'
                }
            });

            // ### Internal Methods
            var executeAction = function (action, arg) {
                App.startApp('Map');
                action(arg);
            }

            // ### Api
            var API = {
                showMap: function (criteria) {
                    console.log('initMap called');
                    require(['apps/map/controller'], function (MapController) {
                        var controller = new App.Map.Controller.Controller();
                        executeAction(controller.showMap, criteria);
                    });
                }
            }

            // ### Start the rotuer
            App.addInitializer(function () {
                new Map.Router({
                    controller: API
                });
            });
        }
    });

    return App.Map;
})