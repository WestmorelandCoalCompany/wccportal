define([
    'app',
    'hbs!apps/weekly/header/templates/header'
], function (App, headerTpl) {
    App.module('Weekly.Header.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.HeaderView = Marionette.ItemView.extend({
                // Configuration
                template: headerTpl,
                tagName: 'h3',

                // Events
                modelEvents: {
                    'change': 'render'
                }
            });
        }
    });

    return App.Weekly.Header.Views;
});