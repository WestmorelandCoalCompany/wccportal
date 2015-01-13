define([
    'app',
    'apps/weekly/views'
], function (App) {
    App.module('Weekly', {
        define: function (Weekly, App, Backbone, Marionette, $, _) {
            Weekly.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('global'),
                intercom: Backbone.Radio.channel('weekly'),

                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly');
                    }

                    this.intercom.on('weekly:navigate:safety', function() {
                        this.initSafety();
                    }, this);

                    this.intercom.on('weekly:navigate:sales', function() {
                        this.initSales();
                    }, this);

                    this.intercom.on('weekly:navigate:inventory', function() {
                        this.initInventory();
                    }, this);

                    this.init();
                },

                onDestroy: function() {
                    this.intercom.off(null, null, this);
                },

                // Internal Methods
                startSubApp: function (appName, args) {
                    var currentApp = appName ? App.module(appName) : null;
                    if (Weekly.currentApp === currentApp) { return; }

                    if (Weekly.currentApp) {
                        Weekly.currentApp.stop();
                    }

                    Weekly.currentApp = currentApp;
                    if (currentApp) {
                        currentApp.start(args);
                    }
                },

                // Main Init
                init: function() {
                    Weekly.Layout = new App.Weekly.Views.LayoutView();
                    App.mainRegion.show(Weekly.Layout);
                    this.getCurrentUser();
                    this.initHeader();
                    this.initMainMenu();
                    //this.initOpMenu();
                    this.initDateMenu();
                    this.initSafety();
                },

                // Main Components
                getCurrentUser: function() {
                    require(['apps/main/user/controller'], function(UserController) {
                        Weekly.userController = new UserController.Controller();
                    });
                },

                initDateMenu: function() {
                    require(['apps/weekly/dateMenu/controller'], function() {
                        Weekly.dateMenuController = new App.Weekly.DateMenu.Controller();
                    });
                },

                initHeader: function() {
                    require(['apps/weekly/header/controller'], function() {
                        Weekly.headerController = new App.Weekly.Header.Controller();
                    });
                },

                initMainMenu: function() {
                    require(['apps/weekly/mainMenu/controller'], function() {
                        Weekly.mainMenuController = new App.Weekly.MainMenu.Controller();
                    });
                },

                initOpMenu: function() {
                    require(['apps/weekly/opMenu/controller'], function() {
                        Weekly.opMenuController = new App.Weekly.OpMenu.Controller();
                        Weekly.opMenuController.init();
                    });
                },

                // Subapps
                initSafety: function() {
                    require(['apps/weekly/safety/controller'], function() {
                        if (Weekly.appController) {
                            Weekly.appController.destroy();
                        }
                        Weekly.appController = new App.Weekly.Safety.Controller();
                        Weekly.appController.init();
                    });
                },

                initSales: function() {
                    require(['apps/weekly/sales/controller'], function(SalesController) {
                        startAppController(SalesController);
                    });
                },

                initInventory: function() {
                    require(['apps/weekly/inventory/controller'], function(InvController) {
                        startAppController(InvController);
                    });
                }
            });

            // Module Methods
            var startAppController = function(AppController) {
                if (!Weekly.appController || (Weekly.appController && (!(Weekly.appController instanceof AppController.Controller)))) {
                    if (Weekly.appController) {
                        console.log('destroying Weekly.appController');
                        Weekly.appController.destroy();
                        delete Weekly.appController;
                    }
                    Weekly.appController = new AppController.Controller();
                }
                Weekly.appController.init();
            }
        }
    });

    return App.Weekly;
});