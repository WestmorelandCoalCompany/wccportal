define([
    'app',
    'apps/weekly/edit/views'
], function (App, Views) {
    App.module('Weekly.Edit', {
        define: function (Edit, App, Backbone, Marionette, $, _) {
            Edit.Controller = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    api: {
                        name: 'weekly:api'
                    },
                    intercom: {
                        name: 'weekly'
                    },
                    main: {
                        name: 'main:api'
                    }
                },


                //  Initializers
                //  ------------

                init: function (options) {
                    _.each(this.initializers, function (method, name) {
                        method.call(this);
                    }, this);
                },

                initializers: {
                    // initialize the sub layout
                    layout: function () {
                        var name = 'layout';
                        this.initView(name, Views.LayoutView);
                        this.intercom.command('update:region', 'contentRegion', this.views.get(name));
                    },

                    // set date range to monthly
                    setDateMode: function () {
                        this.api.command('date:monthly');
                    },

                    // initialReport
                    initialTable: function () {
                        this.list();
                    }
                },


                //  Route Handlers
                //  --------------

                // Create a new entry with applicable settings and pass to edit form
                add: function () {
                    var entry = this.api.request('entries:new'),
                        activeOperation = this.main.request('operations:current'),
                        date = this.api.request('date:get');

                    entry.set({
                        'Week_Begin': M.getDayOfWeek(new Date(), 1, 0),
                        'Operation': activeOperation
                    });
                    this.edit({model: entry});
                },

                // Show entry form
                edit: function (args) {
                    var layout = this.views.get('layout'),
                        entry = args.model || args,
                        op_xhr = this.main.request('operations:get'),
                        name = 'form';

                    $.when(op_xhr).done(_.bind(function (operations) {
                        // Show the form
                        this.initView(name,
                            Views.FormView,
                            {
                                events: {
                                    'back': 'back',
                                    'delete': 'delete',
                                    'publish': 'publish',
                                    'save': 'save'
                                }
                            },
                            {
                                model: entry,
                                operations: operations.toJSON()
                            }
                        );
                        layout.contentRegion.show(this.views.get(name));
                    }, this));
                },

                // Show list of all entries in the active month for a given operation
                list: function () {
                    var layout = this.views.get('layout'),
                        xhr = this.api.request('entries:get'),
                        name = 'list';

                    $.when(xhr).done(_.bind(function(entries) {
                        this.initView(name,
                            Views.ListView,
                            {
                                events: {
                                    'add': 'add',
                                    'childview:edit': 'edit'
                                }
                            },
                            {collection: entries}
                        );
                        // Clear any visible alerts
                        layout.alertRegion.empty();
                        layout.contentRegion.show(this.views.get(name));
                    }, this));
                },


                //  View Handlers
                //  -------------

                // Show an alert
                alert: function (options) {
                    var alert = new Views.AlertView(options);
                    this.views.add({
                        name: 'alert',
                        view: alert
                    });
                    this.views.get('layout').alertRegion.show(alert);
                },

                // Alert success
                alertSuccess: function (msg) {
                    var options = {
                        content: '<strong>Success!</strong> ' + msg,
                        context: 'alert-success'
                    };
                    this.alert(options);
                },

                // Alert failure
                alertFailure: function (msg) {
                    var options = {
                        content: '<strong>Error!</strong> ' + msg,
                        context: 'alert-danger'
                    };
                    this.alert(options);
                },

                // Return to entry list
                back: function (args) {
                    var entry = args.model;
                    if (entry.hasChanged()) {
                        var title = 'Warning',
                            msg = 'Are you sure you want to leave? You will lose all unsaved data.';
                        this.intercom.command('warn', title, msg, this.list);
                    }
                    else {
                        this.list();
                    }
                },

                // Delete an entry
                delete: function (args) {
                    var entry = args.model,
                        title = 'Warning',
                        msg = 'Are you sure you want to delete Entry #' + entry.id + '?';

                    var onSuccess = _.bind(function (msg) {
                            this.list();
                            this.alertSuccess(msg);
                        }, this),
                        onFailure = _.bind(function (msg) {
                            this.alertFailure(('There was an error while attempting to remove the entry. ' + msg));
                        }, this),
                        callback = _.bind(function () {
                            var xhr = this.api.request('entries:delete', entry);
                            $.when(xhr).then(onSuccess, onFailure);
                        }, this);

                    this.intercom.command('warn', title, msg, callback);
                },

                // Publish an entry
                publish: function(args) {
                    var title = 'Warning',
                        msg = "Are you sure you're ready to publish?";

                    var callback = _.bind(function() {
                        args.model.set({Published: true});
                        this.save(args);
                    }, this);

                    this.intercom.command('warn', title, msg, callback);
                },

                // Save an entry
                save: function(args) {
                    var entry = args.model,
                        onSuccess = _.bind(function (msg) {this.alertSuccess(msg);}, this),
                        onFailure = _.bind(function (msg) {this.alertFailure(msg);}, this);

                    if (entry.isNew()) {
                        var xhr = this.api.request('entries:create', entry);
                    }
                    else {
                        var xhr = this.api.request('entries:update', entry);
                    }
                    $.when(xhr).then(onSuccess, onFailure);
                }
            });
        }
    });

    return App.Weekly.Edit;
});