define([
    'app',
    'apps/weekly/api'
], function (App, API) {
    App.module('Weekly', {
        define: function (Weekly, App, Backbone, Marionette, $, _) {
            Weekly.Controller = M.Controller.extend({
                //  Routes
                //  ------
                prefix: 'weekly',
                routes: {
                    '': 'home',
                    'edit': 'edit'
                },

                //  Radio
                //  -----
                channels: {
                    channel: {},
                    intercom: {
                        name: 'weekly',
                        events: {
                            reply: {
                                'options': 'getOptions'
                            },
                            on: {
                                'home': 'home',
                                'edit': 'edit'
                            }
                        }
                    }
                },

                //  Initializers
                //  ------------
                init: function() {
                    // Configure API
                    var api = new API.API();
                    this.controllers.add({
                        name: 'api',
                        controller: api
                    });
                    this.api = api;
                },

                //  Route Handlers
                //  --------------
                home: function() {
                    require(['apps/weekly/report/controller'], $.proxy(function(C) {
                        this.initSubApp(C.Controller, 'app');
                        if (this.navigate) this.navigate('report');
                    }, this));
                },

                edit: function() {
                    require(['apps/weekly/edit/controller'], $.proxy(function(C) {
                        this.initSubApp(C.Controller, 'app');
                        if (this.navigate) this.navigate('edit');
                    }, this));
                },

                //  Internal Methods
                //  ----------------

                // Handle date or operation change
                getOptions: function() {
                    var defer = $.Deferred(),
                        date = this.api.request('date'),
                        xhr = this.channel.request('selected:operation');

                    $.when(xhr).done($.proxy(function(operation) {
                        var options = {
                            update: true,
                            start: date.get('start'),
                            end: date.get('end'),
                            operation: operation
                        };
                        defer.resolve(options);
                    }, this));
                    return defer.promise();
                },

                // Initialize a subcontroller
                initSubApp: function(controller, name) {
                    var c = this.controllers.get(name);
                    if (!c || (!(c instanceof controller))) {
                        if (c) this.controllers.destroy(name);
                        c = new controller();
                        this.controllers.add({name: name, controller: c});
                    }
                    else {
                        c.init()
                    }
                }
            });
        }
    });

    return App.Weekly;
});