define([
    'app',
    'apps/main/navigation/models',
    'apps/main/navigation/views'
], function (App) {
    App.module('Main.Navigation', {
        define: function (Navigation, App, Backbone, Marionette, $, _) {
            Navigation.Controller = Marionette.Controller.extend({
                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    this.showNavigation();
                },

                channel: Backbone.Radio.channel('global'),

                showNavigation: function() {
                    var menuCollection = this.channel.request('models:main:navigation');
                    var view = new App.Main.Navigation.Views.NavigationView({
                        collection: menuCollection
                    });

                    App.navigationRegion.show(view);
                }
            });
        }
    });

    return App.Main.Navigation;
});