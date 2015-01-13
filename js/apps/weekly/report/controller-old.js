define([
    'app',
    'apps/weekly/api',
    'apps/weekly/common/views',
    'apps/weekly/report/views'
], function (App, API, CommonViews, ReportViews) {
    App.module('Weekly.Report', {
        define: function (Report, App, Backbone, Marionette, $, _) {
            Report.Controller = M.Controller.extend({
                //  Channels
                //  --------
                channels: {
                    channel: {
                        events: {
                            on: {
                                'changed:operation': 'changeOp'
                            }
                        }
                    },
                    intercom: {
                        name: 'weekly',
                        events: {
                            comply: {
                                'change:op': 'updateOp'
                            }
                        }
                    },
                    api: {
                        name: 'weekly:api'
                    }
                },

                //  Initializers
                //  ------------
                init: function() {
                    // Initialize the layout
                    var layout = new CommonViews.LayoutView();
                    this.views.add({
                        name: 'layout',
                        view: layout,
                        events: {
                            'edit': 'edit',
                            'next': 'nextOp',
                            'prev': 'prevOp'
                        }
                    });
                    App.mainRegion.show(layout);

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
                    layout.dateMenu.show(dateView);

                    // Initialize the operation dropdown menu
                    var operations = this.channel.request('operations');
                    var opView = new CommonViews.OperationMenuView({
                        collection: operations
                    });
                    this.views.add({
                        name: 'opMenu',
                        view: opView,
                        events: {
                            'childview:select:operation': 'updateOp'
                        }
                    });
                    layout.opMenu.show(opView);

                    // Select users operation if applicable
                    var location_xhr = this.channel.request('user', {property: 'location'});
                    $.when(location_xhr).done(function(location) {
                        var active = operations.findWhere({Title: location});
                        if (active) {
                            active.select()
                        }
                        else {
                            operations.at(0).select();
                        }
                    });
                },

                onDestroy: function() {delete this.api;},

                //  Route Handlers
                //  --------------
                home: function() {
                    var layout = this.views.get('layout'),
                        dateMenu = this.views.get('dateMenu');
                    var entries = this.api.request('weekly:entry');

                    // create the view
                    var view = new ReportViews.ReportView({
                        collection: entries
                    });
                    this.views.add({name: 'entry', view: view});

                    // show it
                    layout.content.show(view);
                },

                //  View Event Handlers
                //  -------------------

                // Go to edit
                edit: function() {
                    this.intercom.trigger('edit');
                },

                changeOp: function() {
                    var layout = this.views.get('layout'),
                        view = this.views.get('opMenu'),
                        title = view.collection.selected.get('Title');
                    Marionette.triggerMethodOn(layout, 'update:title', title)
                },

                nextOp: function() {
                    this.channel.command('change:operation', {direction: 'next'});
                },

                prevOp: function() {
                    this.channel.command('change:operation', {direction: 'previous'});
                },

                updateOp: function(args) {
                    var layout = this.views.get('layout'),
                        model = args.model;
                    model.select();
                }
            });
        }
    });

    return App.Weekly.Report;
});