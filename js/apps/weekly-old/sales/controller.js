define([
    'app',
    'apps/weekly/sales/models'
], function (App) {
    App.module('Weekly.Sales', {
        define: function (Sales, App, Backbone, Marionette, $, _) {
            Sales.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('weekly'),
                intercom: Backbone.Radio.channel('weekly.sales'),

                initialize: function () {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn(this.intercom.channelName);
                    }

                    this.intercom.on('list:entries', function() {
                        this.showList();
                    }, this);

                    this.intercom.on('add:entry', function() {
                        this.showAddForm();
                    }, this);

                    this.intercom.on('edit:entry', function(entry) {
                        this.showEditForm(entry);
                    }, this);
                },

                onDestroy: function () {
                    this.intercom.command('destroy');
                    Sales.appController.destroy();
                    delete Sales.appController;
                    this.channel.off(null, null, this);
                    this.intercom.off(null, null, this);
                },

                // Main Methods
                init: function () {
                    this.showList();
                },

                showList: function() {
                    require(['apps/weekly/sales/show/controller'], function(ShowController) {
                        startAppController(ShowController);
                        Backbone.Radio.command('weekly.sales.show', 'list:entries');
                    });
                },

                showAddForm: function() {
                    require(['apps/weekly/sales/new/controller'], function(AddController) {
                        startAppController(AddController);
                        Backbone.Radio.command('weekly.sales.new', 'add:entry');
                    });
                },

                showEditForm: function(entry) {
                    require(['apps/weekly/sales/edit/controller'], function(EditController) {
                        startAppController(EditController);
                        Backbone.Radio.command('weekly.sales.edit', 'edit:entry', entry);
                    });
                }
            });

            // Module Methods
            var startAppController = function(AppController) {
                if (!Sales.appController || (Sales.appController && (!(Sales.appController instanceof AppController.Controller)))) {
                    if (Sales.appController) {
                        Sales.appController.destroy();
                        delete Sales.appController;
                    }
                    Sales.appController = new AppController.Controller();
                }
                Sales.appController.init();
            }
        }
    });

    return App.Weekly.Sales;
});