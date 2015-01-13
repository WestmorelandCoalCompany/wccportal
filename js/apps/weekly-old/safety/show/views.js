define([
    'app',
    'hbs!apps/weekly/safety/show/templates/item',
    'hbs!apps/weekly/safety/show/templates/panel',
    'hbs!apps/weekly/safety/show/templates/empty'
], function (App, itemTpl, tableTpl, emptyTpl) {
    App.module('Weekly.Safety.Show.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.ItemView = Marionette.ItemView.extend({
                // Configuration
                template: itemTpl,
                tagName: 'tr'
            });

            Views.View = Marionette.CompositeView.extend({
                // Configuration
                template: tableTpl,

                // Child Elements
                childView: Views.ItemView,
                childViewContainer: 'tbody',

                // Events
                collectionEvents: {
                    'all': 'logit'
                },

                logit: function(e) {
                    console.log(e);
                }
            });
        },

        initialize: function() {
            this.intercom = Backbone.Radio.channel('weekly.safety.show');
        },

        onStop: function() {

        }

    });

    return App.Weekly.Safety.Show.Views;
});