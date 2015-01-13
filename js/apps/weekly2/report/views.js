define([
    'app',
    'hbs!apps/weekly/report/templates/layout',
    'hbs!apps/weekly/report/templates/safety/item',
    'hbs!apps/weekly/report/templates/safety/empty',
    'hbs!apps/weekly/report/templates/safety/layout',
], function (App, Layout, SafeyItem, SafetyEmpty, SafetyLayout) {
    App.module('Weekly.Report.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Layout
            //  ------
            Views.LayoutView = Marionette.LayoutView.extend({
                template: Layout,
                regions: {
                    opMenu: '#weekly-op-menu',
                    dateMenu: '#weekly-date-menu',
                    safetyRegion: '#weekly-safety',
                    salesRegion: '#weekly-sales',
                    inventoryRegion: '#weekly-inventory'
                },

                ui: {
                    next: 'button.js-next',
                    prev: 'button.js-previous'
                }
            });

            //  Safety
            //  ------

            // Incident
            Views.Incident = Marionette.ItemView.extend({
                template: SafeyItem,
                tagName: 'tr'
            });

            // Empty
            Views.SafetyEmpty = Marionette.ItemView.extend({
                template: SafetyEmpty,
                tagName: 'tr'
            });

            // Layout
            Views.SafetyView = Marionette.CompositeView.extend({
                template: SafetyLayout,
                tagName: 'div',
                emptyView: Views.SafetyEmpty,

                childView: Views.Incident,
                childViewContainer: 'tbody',

                templateHelpers: {
                    test: function(msg) {
                        return 'Message: ' + msg;
                    }
                }
            })
        }
    });

    return App.Weekly.Report.Views;
});