define([
    'app',
    'apps/weekly/models'
], function (App, Models) {
    App.module('Weekly.Report', {
        define: function (Report, App, Backbone, Marionette, $, _) {
            Report.API = M.Controller.extend({
                events: {
                    reply: {
                        'date': 'date',
                        'inventory': 'inventory',
                        'safety': 'safety',
                        'safety:data': 'safetyData',
                        'sales': 'sales'
                    }
                },

                //  Initializers
                //  ------------
                init: function() {
                    // Initialize Models
                    var models = {
                        date: Models.DateItem
                    };
                    _.each(models, function(model, name) {
                        var m = this.models.get(name);
                        if (!m || (!(m instanceof model))) {
                            m = new model();
                            this.models.add({name: name, model: m});
                        }
                    }, this);

                    // Initialize Collections
                    var collections = {
                        inventory: Models.InventoryCollection,
                        safety: Models.Incidents,
                        sales: Models.SalesCollection
                    };
                    _.each(collections, function(collection, name) {
                        var c = this.collections.get(name);
                        if (!c || (!(c instanceof collection))) {
                            c = new collection();
                            this.collections.add({name: name, collection: c});
                        }
                    }, this);
                },

                //  GET
                //  ---
                date: function(options) {
                    return this.models.get('date');
                },

                inventory: function(options) {
                    return this.getModels('inventory', options);
                },

                safety: function(options) {
                    options || (options = {});
                    _.extend(options, {plural: true});
                    return this.getModels('safety', options);
                },

                safetyData: function(options) {
                    var defer = $.Deferred(),
                        xhr = this.getCollection('safety', options);
                    $.when(xhr).then(
                        function(incidents) {
                            defer.resolve(incidents.aggregate(options));
                        },
                        function() {defer.reject()}
                    );
                    return defer.promise();
                },

                sales: function(options) {
                    return this.getModels('sales', options);
                },

                //  Helpers
                //  -------

                // Return the first model from a collection by name, matching begin, end, operation
                getModels: function(name, options) {
                    var defer = $.Deferred(),
                        xhr = this.getCollection(name, options),
                        method = options.plural ? 'filter' : 'find';
                    $.when(xhr).then(
                        function(collection) {
                            var models = collection[method](function (m) {
                                var x = m.get('Week_Begin') >= options.start,
                                    y = m.get('Week_End') <= options.end,
                                    z = m.get('Operations') == options.operation;
                                return x && y && z;
                            });
                            if (models && !_.isArray(models)) {
                                if (models.aggregate) models.aggregate(options);
                                models = [models];
                            }
                            defer.resolve(models);
                        },
                        function() {
                            defer.reject()
                        }
                    );
                    return defer.promise();
                },

                // update filter with start date, end date, and operation
                updateFilter: function(vc, options) {
                    options || (options = {});
                    var start = options.start,
                        end = options.end,
                        operation = options.operation;
                    vc.updateFilter(function(m) {
                        var x = m.get('Week_Begin') >= start,
                            y = m.get('Week_End') <= end,
                            z = m.get('Operations') == operation;
                        return x && y && z;
                    });
                }
            });
        }
    });

    return App.Weekly.Report;
});