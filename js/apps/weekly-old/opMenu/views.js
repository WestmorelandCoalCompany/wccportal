/**
 * Created by cludden on 11/21/2014.
 */
define([
    'app',
    'hbs!apps/weekly/opMenu/templates/item',
    'hbs!apps/weekly/opMenu/templates/menu'
], function (App, itemTpl, menuTpl) {
    App.module('Weekly.OpMenu.Views', {
        define: function(Views, App, Backbone, Marionette, $, _) {
            // Radio
            Views.intercom = Backbone.Radio.channel('weekly.opmenu');

            Views.MenuItemView = Marionette.ItemView.extend({
                // Configuration
                template: itemTpl,
                tagName: 'li',

                // Triggers
                events: {
                    'click a': 'changeOperation'
                },

                // Event Handlers
                changeOperation: function(e) {
                    e.preventDefault();
                    Views.intercom.command('change:operation', this.model);
                }
            });

            Views.MenuView = Marionette.CompositeView.extend({
                // Configuration
                template: menuTpl,
                tagName: 'ul',
                className: 'nav navbar-nav navbar-right',

                // Child Elements
                childView: Views.MenuItemView,
                childViewContainer: '#weekly-op-menu-child-container',

                // ui
                ui: {
                    activeOp: '#active-op'
                },

                // Events
                collectionEvents: {
                    'selected': 'render'
                },

                // Internal Methods
                onRender: function() {
                    if (this.collection.selected) {
                        this.ui.activeOp.text(this.collection.selected.get('name'));
                    }
                }
            });
        }
    });

    return App.Weekly.OpMenu.Views;
});