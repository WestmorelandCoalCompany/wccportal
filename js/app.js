define([
    'bootstrap',
    'bootstrap.datepicker',
    'marionette',
    'marionette.m',
], function () {
    var App = new Marionette.Application();

    //  Configuration
    //  -------------

    // Settings
    App.debug = true;
    App.spInterval = 100000;

    // Regions
    App.addRegions({
        navigationRegion: '#navRegion',
        mainRegion: '#DeltaPlaceHolderMain'
    });



    //  Application Extensions & Methods
    //  --------------------------------

    // shortcut to Backbone's navigate method
    App.navigate = function (route, options) {
        Backbone.history.navigate(route, options);
    };

    // shortcut to retrieve the current route
    App.getCurrentRoute = function () {
        return Backbone.history.fragment
    };

    // starting and stopping modules
    App.startSubApp = function (appName, args) {
        var currentApp = appName ? App.module(appName) : null;
        if (App.currentApp === currentApp) { return; }

        if (App.currentApp) {
            App.currentApp.stop();
        }

        App.currentApp = currentApp;
        if (currentApp) {
            currentApp.start(args);
        }
    };



    //  Initializers
    //  ------------

    App.on('start', function () {
        if (Backbone.history) {
            // start the main application
            require(['apps/main/controller', 'apps/main/router'], function (C, R) {
                var _default = instruction ? false : true;
                App.controller = new C.Controller({debug: App.debug, default: _default});
                App.router = new R.Router({controller: App.controller});
                if (Backbone.history) Backbone.history.start();

                if (instruction && App.getCurrentRoute() == '') App.navigate(instruction, {trigger: true});
            });
        }
    });

    return App;
});