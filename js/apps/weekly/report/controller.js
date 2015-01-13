define([
    'app',
    'apps/weekly/report/views'
], function (App, Views) {
    App.module('Weekly.Report', {
        define: function (Report, App, Backbone, Marionette, $, _) {
            Report.Controller = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'api': {
                        name: 'weekly:api',
                        events: {
                            on: {
                                'changed:date': 'updateDate report'
                            }
                        }
                    },
                    'intercom': {
                        name: 'weekly'
                    },
                    'main': {
                        name: 'main:api',
                        events: {
                            on: {
                                'changed:operation': 'updateTitle report'
                            }
                        }
                    }
                },



                //  Initializers
                //  ------------

                init: function(options) {
                    _.each(this.initializers, function(method, name) {
                        method.call(this);
                    }, this);
                },

                initializers: {
                    // initialize the sub layout
                    layout: function() {
                        // create the layout if necessary
                        var name = 'layout';
                        this.initView(name,
                            Views.LayoutView,
                            {events: {
                                'next': 'nextOp',
                                'previous': 'previousOp'
                            }}
                        );
                        this.intercom.command('update:region', 'contentRegion', this.views.get(name));

                        // create the subheading if necessary
                        var active = this.main.request('operations:current');
                        this.updateTitle(active);
                    },

                    // set date range to weekly
                    setDateMode: function() {
                        this.api.command('date:weekly');
                    },

                    // show first report
                    initialReport: function() {
                        this.report();
                    }
                },



                //  Route Handlers
                //  --------------
                report: function() {
                    var xhr = this.api.request('entries:get'),
                        layout = this.views.get('layout'),
                        report;

                    $.when(xhr).done(function(entries) {
                        if (entries.length) {
                            report = new Views.Report({model: entries.at(0)})
                        } else {
                            report = new Views.Empty();
                        }
                        layout.contentRegion.show(report);
                    });
                },



                //  View Handlers
                //  -------------

                // Get the report for the next operation
                nextOp: function() {
                    this.updateSlide();
                    this.main.request('operations:next');
                },

                // Get the report for the previous operation
                previousOp: function() {
                    this.updateSlide('left');
                    this.main.request('operations:prev');
                    this.updateSlide();
                },

                // Toggle slide direction
                updateSlide: function(direction) {
                    direction || (direction = 'right');
                    this.views.get('layout').contentRegion.slideFrom = direction;
                },

                // Update subheading
                updateTitle: function(operation) {
                    var layout = this.views.get('layout');
                    layout.triggerMethod('update:title', operation);
                }
            });
        }
    });

    return App.Weekly.Report;
});