define([
    'app',
    'hbs!apps/weekly/sales/show/templates/item',
    'hbs!apps/weekly/sales/show/templates/empty',
    'hbs!apps/weekly/sales/show/templates/layout'
], function (App, itemTpl, emptyTpl, layoutTpl) {
    App.module('Weekly.Sales.Show.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.ItemView = Marionette.ItemView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.sales');
                },

                // Configuration
                template: itemTpl,

                // UI
                ui: {
                    edit: 'button.js-edit'
                },

                // Events
                events: {
                    'click @ui.edit': 'editItem'
                },

                // Event Handlers
                editItem: function(e) {
                    e.preventDefault();
                    this.intercom.trigger('edit:entry', this.model);
                }
            });

            Views.EmptyView = Marionette.ItemView.extend({
                template: emptyTpl
            });

            Views.ListView = Marionette.CompositeView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.sales');
                },

                // Configuration
                tagName: 'div',
                template: layoutTpl,
                emptyView: Views.EmptyView,

                // Child View
                childView: Views.ItemView,
                childViewContainer: '#sales-list',

                // UI
                ui: {
                    add: 'button#sales-new'
                },

                // Events
                events: {
                    'click @ui.add': 'clickAdd'
                },
                collectionEvents: {
                    'reset': 'render',
                    'change': 'render'
                },

                // Event Handlers
                clickAdd: function(e) {
                    e.preventDefault();
                    this.intercom.trigger('add:entry');
                }
            });
        }
    });

    return App.Weekly.Sales.Show.Views;
});