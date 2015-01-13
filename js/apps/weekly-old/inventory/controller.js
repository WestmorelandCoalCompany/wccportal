define([
    'app',
    'apps/weekly/inventory/models',
    'apps/weekly/inventory/common/views'
], function (App) {
    App.module('Weekly.Inventory', {
        define: function (Inventory, App, Backbone, Marionette, $, _) {
            Inventory.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('weekly'),
                intercom: Backbone.Radio.channel('weekly.inventory'),

                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly.inventory');
                    }

                    this.intercom.on('list:entries', function() {
                        this.showList();
                    }, this);

                    this.intercom.on('add:entry', function() {
                        this.addEntry();
                    }, this);

                    this.intercom.on('edit:entry', function(entry) {
                        this.editEntry(entry);
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.command('destroy');
                    Inventory.appController.destroy();
                    delete Inventory.appController;
                    this.channel.off(null, null, this);
                    this.intercom.off(null, null, this);
                },

                // Main Methods
                init: function() {
                    this.showList();
                },

                addEntry: function() {
                    require(['apps/weekly/inventory/new/controller'], function(NewController) {
                        if (Inventory.appController && (!(Inventory.appController instanceof NewController.Controller))) {
                            Inventory.appController.destroy();
                        }
                        Inventory.appController = new NewController.Controller();
                        Backbone.Radio.command('weekly.inventory.new', 'add:entry');
                    });
                },

                editEntry: function(entry) {
                    require(['apps/weekly/inventory/edit/controller'], function(EditController) {
                        if (Inventory.appController && (!(Inventory.appController instanceof EditController.Controller))) {
                            Inventory.appController.destroy();
                        }
                        Inventory.appController = new EditController.Controller();
                        Backbone.Radio.command('weekly.inventory.edit', 'edit:entry', entry);
                    });
                },

                showList: function() {
                    require(['apps/weekly/inventory/show/controller'], function(ShowController) {
                        if (Inventory.appController && (!(Inventory.appController instanceof ShowController.Controller))) {
                            Inventory.appController.destroy();
                        }
                        Inventory.appController = new App.Weekly.Inventory.Show.Controller();
                        Backbone.Radio.command('weekly.inventory.show', 'list:entries');
                    });
                }
            })
        }
    });

    return App.Weekly.Inventory;
});