define([
    'app',
    'apps/weekly/report/api',
    'apps/weekly/report/views',
    'apps/weekly/common/views'
], function (App, API, Views, CommonViews) {
    App.module('Weekly.Report', {
        define: function (Report, App, Backbone, Marionette, $, _) {
            Report.Controller = M.Controller.extend({
                //  Routes
                //  ------
/*                prefix: 'weekly/report',
                routes: {
                    '': 'home',
                    'home': 'home'
                },*/

                //  Channels
                //  --------
                channels: {
                    'channel': {}
                },

                //  Initializers
                //  ------------
                init: function() {
                    // Configure API
                    var api = this.controllers.get('api');
                    if (!api) {
                        api = new API.API();
                        this.controllers.add({name: 'api', controller: api});
                    }
                    this.api = api;

                    // Call additional initalizers
                    this.layout();
                },

                onDestroy: function() {
                    delete this.api;
                },

                // Configure Layout
                layout: function() {
                    // Initialize the layout
                    var layout = new Views.LayoutView();
                    this.views.add({name: 'layout', view: layout});
                    App.mainRegion.show(layout);

                    // Initialize the operation dropdown menu
                    var op_xhr = this.channel.request('operations');
                    $.when(op_xhr).done($.proxy(function(operations) {
                        // Create the menu
                        var opView = new CommonViews.OperationMenuView({
                            collection: operations
                        });
                        this.views.add({
                            name: 'opMenu',
                            view: opView,
                            events: {
                                'childview:select:operation': 'home'
                            }
                        });
                        layout.opMenu.show(opView);

                        // Select users operation if applicable
                        var location_xhr = this.channel.request('user', {property: 'location'});
                        $.when(location_xhr).done(function(location) {
                            var active = operations.findWhere({Title: location});
                            if (active) active.select();
                        });
                    }, this));

                    // Initialize the date menu
                    var date = this.api.request('date');
                    var dateView = new CommonViews.DateMenuView({model: date});
                    this.views.add({
                        name: 'dateMenu',
                        view: dateView,
                        events: {
                            'change:date': 'home'
                        }
                    });
                    layout.dateMenu.show(dateView)
                },

                initSafety: function() {
                    // init sub layout

                },

                //  Route Handlers
                //  --------------
                home: function() {
                    var xhr = this.getOptions();
                    $.when(xhr).done($.proxy(function(options) {
                        this.home_sales(options);
                        this.home_safety(options);
                    }, this));
                },

                //  Route Helpers
                //  -------------
                home_safety: function(options) {
                    var xhr1 = this.api.request('safety', options),
                        xhr2 = this.api.request('safety:data', options),
                        xhr3 = this.api.request('safety:data', {
                            operation: options.operation,
                            start: new Date(options.end.getFullYear(),0,1,0,0,0),
                            end: options.end
                        });
                    $.when(xhr1, xhr2, xhr3).done($.proxy(function(incidents, week, year) {
                        var layout = this.views.get('layout'),
                            safety = new Views.SafetyView({
                                collection: incidents
                            });
                        this.views.add({name: 'safety', view: safety});
                        layout.safety.show(safety);
                    }, this))
                },

                home_sales: function(options) {
                    var xhr = this.api.request('sales', options);
                    $.when(xhr).done($.proxy(function(model) {
                        console.log('Sales: ', model);
                    }, this))
                },

                home_inventory: function(options) {

                },

                //  View Event Handlers
                //  -------------------

                // Handle date or operation change
                getOptions: function() {
                    var defer = $.Deferred(),
                        date = this.api.request('date'),
                        xhr = this.channel.request('selected:operation');

                    $.when(xhr).done($.proxy(function(operation) {
                        var options = {
                            start: date.get('start'),
                            end: date.get('end'),
                            operation: operation
                        };
                        defer.resolve(options);
                    }, this));
                    return defer.promise();
                }
            });
        }
    });

    return App.Weekly.Report;
});