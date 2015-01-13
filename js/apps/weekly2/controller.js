define([
    'app',
], function (App) {
    App.module('Weekly', {
        define: function (Weekly, App, Backbone, Marionette, $, _) {
            Weekly.Controller = M.Controller.extend({
                // Router
                prefix: 'weekly',
                routes: {
                    '': 'home',
                    'edit': 'safety',
                    'edit/safety': 'safety',
                    'edit/sales': 'sales',
                    'edit/inventory': 'inventory'
                },

                // Radio
                channels: {
                    'channel': {}
                },

                // Route Handlers
                home: function() {
                    require(['apps/weekly/report/controller'], $.proxy(function(C) {
                        this.initSubApp(C.Controller, 'app');
                        if (this.navigate) this.navigate('report');
                    }, this));
                },

                inventory: function() {
                    require(['apps/weekly/edit/inventory/controller'], $.proxy(function(C) {
                        this.initSubApp(C.Controller, 'app');
                        if (this.navigate) this.navigate('edit/inventory');
                    }, this));
                },

                safety: function() {
                    require(['apps/weekly/edit/safety/controller'], $.proxy(function(C) {
                        this.initSubApp(C.Controller, 'app');
                        if (this.navigate) this.navigate('edit/safety');
                    }, this));
                },

                sales: function() {
                    require(['apps/weekly/edit/sales/controller'], $.proxy(function(C) {
                        this.initSubApp(C.Controller, 'app');
                        if (this.navigate) this.navigate('edit/sales');
                    }, this));
                },

                // Methods
                initSubApp: function(controller, name) {
                    var c = this.controllers.get(name);
                    if (!c || (!(c instanceof controller))) {
                        c = new controller();
                        this.controllers.add({name: name, controller: c});
                    }
                }
            });
        }
    });

    return App.Weekly;
});