define([
    'app',
    'hbs!apps/weekly/inventory/show/templates/item',
    'hbs!apps/weekly/inventory/show/templates/empty',
    'hbs!apps/weekly/inventory/show/templates/layout'
], function (App, itemTpl, emptyTpl, layoutTpl) {
    App.module('Weekly.Inventory.Show.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.ItemView = Marionette.ItemView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.inventory');
                },

                // Configuration
                template: itemTpl,
                templateHelpers: {
                    endingPitInventory: function() {
                        return this.model.get('Beginning_Pit_Inventory') + this.model.get('Tons_Unconvered') -
                                this.model.get('Tons_Produced');
                    },
                    totalInventory: function() {
                        return this.model.get('Beginning_Pit_Inventory') + this.model.get('Tons_Unconvered') -
                            this.model.get('Tons_Produced') + this.model.get('Ending_Stockpile_Inventory');
                    }
                },

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

            /*Views.ShowView = Marionette.CollectionView.extend({
                // Configuration
                tagName: 'div',
                childView: Views.ItemView,
                emptyView: Views.EmptyView
            });*/

            Views.ShowView = Marionette.CompositeView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.inventory');
                },

                // Configuration
                tagName: 'div',
                template: layoutTpl,
                emptyView: Views.EmptyView,

                // Child View
                childView: Views.ItemView,
                childViewContainer: '#inventory-list',

                // UI
                ui: {
                    add: 'button#inventory-new'
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
                    e.stopPropagation();
                    this.intercom.trigger('add:entry');
                }
            });
        }
    });

    return App.Weekly.Inventory.Show.Views;
});