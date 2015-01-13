define([
    'app',
    'apps/weekly/entities/entries/models',
    'backbone.vc'
], function (App, Models) {
    App.module('Weekly.Entities.Entries.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'api': {
                        name: 'weekly:api',
                        events: {
                            on: {
                                'changed:date': 'updateDate',
                                'changed:date:mode': 'updateDate'
                            },
                            reply: {
                                'entries:new': 'newEntry',
                                'entries:get': 'get',
                                'entries:published:only': 'updatePublishedOnly',
                                'entries:create': 'create',
                                'entries:delete': 'delete',
                                'entries:update': 'update'
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
                                'changed:operation': 'updateOperation'
                            }
                        }
                    }
                },



                //  Initializers
                //  ------------

                // initialize the collections and grab the data
                init: function(options) {
                    _.each(this.initializers, function(method, name) {
                        method.call(this);
                    }, this);
                },

                // initializers
                initializers: {
                    // create entry collection and fetch data
                    entries: function() {
                        var name = 'entries';
                        this.initCollection(name, Models.Entries);
                        this.getCollection(name);
                    },

                    // create the constraints model to hold applicable filter constraints
                    constraints: function() {
                        var constraints = new Backbone.Model({
                            start: new Date(),
                            end: new Date(),
                            operation: null,
                            publishedOnly: true
                        });
                        this.models.add({
                            name: 'constraints',
                            model: constraints
                        });
                    },

                    // create the filtered entry collection and update the filters
                    filtered: function() {
                        this.collections.add({
                            name: 'filtered',
                            collection: new VirtualCollection(this.collections.get('entries'))
                        });
                        this.updateFilter();
                    }
                },



                //  API Methods
                //  -----------

                // DELETE entry
                delete: function(entry) {
                    var defer = $.Deferred();
                    entry.destroy({
                        wait: true,
                        success: function(model, res, options) {
                            var msg = 'Entry #' + model.id + ' was successfully removed.';
                            defer.resolve(msg);
                        },
                        failure: function(model, res, options) {
                            defer.reject(res.error.message.value);
                        }
                    });
                    return defer.promise();
                },

                // GET entries
                get: function(options) {
                    options || (options = {});
                    var entries = this.collections.get('entries'),
                        filtered = this.collections.get('filtered'),
                        defer = $.Deferred();

                    if (entries.length) {
                        defer.resolve(filtered);
                    }
                    else {
                        var xhr = this.getCollection('entries'),
                            onSuccess = function() {
                                defer.resolve(filtered);
                            },
                            onFailure = function() {
                                defer.reject();
                            }
                        $.when(xhr).then(onSuccess, onFailure);
                    }

                    return defer.promise();
                },

                // Return new entry
                newEntry: function() {
                    return new Models.Entry();
                },

                // SAVE new entry and add it to collection
                create: function(entry) {
                    var defer = $.Deferred(),
                        entries = this.collections.get('entries'),
                        data = entry.toJSON();

                    var saved = entry.save(data, {
                        success: function(model, res, options) {
                            entries.add(entry);
                            var msg = 'New entry was successfully created.';
                            defer.resolve(msg);
                        },
                        error: function(model, res, options) {
                            defer.reject(res.error.message.value);
                        }
                    });
                    if (saved === false) defer.reject(entry.validationError);

                    return defer.promise();
                },

                // UPDATE existing entry
                update: function(entry, defer) {
                    var defer = $.Deferred();

                    var saved = entry.save(entry.toJSON(), {
                        updated: true,
                        success: function(model, res, options) {
                            var msg = 'Entry #' + model.id + ' was successfully updated.';
                            defer.resolve(msg);
                        },
                        error: function(model, res, options) {
                            defer.reject(res.error.message.value);
                        }
                    });
                    if (saved === false) defer.reject(entry.validationError);

                    return defer.promise();
                },



                //  Internal Methods
                //  ----------------

                // update constraints with new data and reapply the filter
                updateConstraints: function(data) {
                    var m = this.models.get('constraints');
                    m.set(data);
                    this.updateFilter();
                },

                // update constraints with new date
                updateDate: function(date) {
                    var data = {
                        start: date.get('start'),
                        end: date.get('end')
                    };
                    this.updateConstraints(data);
                },

                // update constraints with new operation
                updateOperation: function(operation) {
                    var data = {
                        operation: operation
                    };
                    this.updateConstraints(data);
                },

                // update constraints to show unpublished entries on edit side
                updatePublishedOnly: function(val) {
                    var data = {
                        publishedOnly: val
                    };
                    this.updateConstraints(data);
                },

                // update filters with date and/or operation
                updateFilter: function() {
                    var entries = this.collections.get('filtered'),
                        constraints = this.models.get('constraints');

                    entries.updateFilter(function(model) {
                        // declare tests
                        var tests = [
                            model.get('Week_Begin') >= constraints.get('start'),
                            model.get('Week_Begin') <= constraints.get('end'),
                            model.get('Operation') == constraints.get('operation'),
                            (constraints.get('publishedOnly') ? model.get('Published') : true)
                        ];
                        var include = true;

                        // evaluate tests
                        _.each(tests, function(res) {
                            if (!res) include = false;
                        });

                        return include;
                    });
                }
            });
        }
    });

    return App.Weekly.Entities.Entries.API;
});