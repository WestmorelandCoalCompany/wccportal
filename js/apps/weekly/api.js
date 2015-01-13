define([
    'app',
    'apps/weekly/models'
], function (App, Models) {
    App.module('Weekly.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                channels: {
                    channel: {
                        events: {
                            on: {
                                'changed:operation': 'updateFilters'
                            }
                        }
                    },
                    intercom: {
                        name: 'weekly:api',
                        events: {
                            reply: {
                                'date': 'date',
                                'delete:entry': 'deleteEntry',
                                'save:entry': 'saveEntry',
                                'weekly': 'entries',
                                'weekly:entry': 'entries_filtered',
                                'weekly:new': 'entry'
                            }
                        }
                    }
                },

                events: {
                    comply: {
                        'next:op': 'nextOp',
                        'prev:op': 'prevOp'
                    },
                    reply: {
                        'date': 'date',
                        'weekly': 'weekly'
                    }
                },

                init: function() {
                    // Initialize Models
                    var models = {
                        date: Models.DateItem
                    };
                    _.each(models, function(model, name) {
                        var m = this.models.get(name);
                        if (!m || (!(m instanceof model))) {
                            m = new model();
                            this.models.add({name: name, model: m, events: {'change': 'updateFilters'}});
                        }
                    }, this);

                    // Initialize Collections
                    var collections = {
                        weekly: Models.WeeklyCollection
                    };
                    _.each(collections, function(collection, name) {
                        var c = this.collections.get(name);
                        if (!c || (!(c instanceof collection))) {
                            c = new collection();
                            this.collections.add({name: name, collection: c});
                            this.getCollection(name);
                        }
                    }, this);

                    // Virtual Collections
                    this.initFiltered();
                },

                initFiltered: function() {
                    var weekly = this.collections.get('weekly'),
                        filtered = new VirtualCollection(weekly);
                    this.collections.add({
                        name: 'weeklyFiltered',
                        collection: filtered
                    });
                },

                //  Get
                //  ---

                // Date Model
                date: function(options) {
                    return this.models.get('date');
                },

                // Weekly Entries
                entries: function(options) {
                    return this.getCollection('weekly', options);
                },

                // New Weekly Entry
                entries_filtered: function(options) {
                    options || (options = {});
                    this.updateFilters(options);
                    var filtered = this.collections.get('weeklyFiltered');
                    return filtered;
                },

                // New Weekly entry
                entry: function() {
                    return new Models.WeeklyItem();
                },

                //  Post
                //  ----

                // Delete Entry
                deleteEntry: function(model, options) {
                    options || (options = {});
                    var defer = $.Deferred();

                    $.extend(options, {
                        deleted: true,
                        wait: true,
                        etag: '*',
                        success: function() {defer.resolve();},
                        error: function() {defer.reject();}
                    });

                    var destroyed = model.destroy(options);
                    if (!destroyed) defer.reject();
                    return defer.promise();
                },

                // Save Entry
                saveEntry: function(model, data, options) {
                    options || (options = {});
                    var defer = $.Deferred(),
                        isNew = model.isNew(),
                        msg = '';

                    $.extend(options, {
                        etag: '*',
                        success: $.proxy(function(model, res, options) {
                            if (isNew) {
                                msg = 'New weekly entry was successfully created.'
                                var entries = this.collections.get('weekly');
                                entries.add(model);
                            }
                            else {
                                msg = 'Entry #' + model.id + ' was successfully updated.';
                            }
                            defer.resolve(msg);
                        }, this),
                        error: function(model, res, options) {
                            var msg = res.error.message.value;
                            defer.reject(msg);
                        }
                    });
                    if (!isNew)  {
                        $.extend(options, {updated: true});
                    }

                    var saved = model.save(data, options);
                    if (!saved) {
                        defer.reject(model.validationError);
                    }
                    return defer.promise();
                },

                //  Helpers
                //  -------
                formatSPDateString: function(date) {
                    date = new Date(date);
                    return "datetime'" + date.toISOString() + "'";
                },

                updateFilters: function(options) {
                    options || (options = {});
                    var date = this.date(),
                        operations = this.channel.request('operations'),
                        filtered = this.collections.get('weeklyFiltered');
                    filtered.updateFilter(function(model) {
                        var x = model.get('Week_Begin') >= date.get('start'),
                            y = model.get('Week_Begin') <= date.get('end'),
                            z = true;
                        if (operations && operations.selected) {
                            z = model.get('Operation') == operations.selected.get('Title');
                        }
                        if (options.ignoreDate) return z;
                        return x && y && z;
                    });
                }
            });
        }
    });

    return App.Weekly.API;
});