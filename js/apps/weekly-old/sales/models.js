define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('Weekly.Sales.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Module Variables
            var root = '/Operations';

            // Sales Items
            Models.SalesItem = Backbone.SP.Item.extend({
                site: root,
                list: 'Weekly Sales',
                defaults: {
                    __metadata: {
                        type: "SP.Data.Weekly_x0020_SalesListItem"
                    }
                },

                parse: function(res, options) {
                    if (options.saved) {
                        return this.attributes;
                    }
                    else {
                        if (res.Week_Begin) {
                            res.Week_Begin = new Date(res.Week_Begin);
                        }
                        if (res.Week_End) {
                            res.Week_End = new Date(res.Week_End);
                        }
                        return res;
                    }
                }
            });

            Models.SalesCollection = Backbone.SP.List.extend({
                model: Models.SalesItem,
                fetch: function(options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                fetchYTD: function(options) {
                    options || (options = {});
                    if (!options.date) { options.date = new Date(); }

                    var begin = new Date(options.date.getFullYear(), 0, 1),
                        end = new Date(options.date.getFullYear(), options.date.getMonth() + 1, 0),
                        fbegin = this.formatSPdateString(begin),
                        fend = this.formatSPdateString(end);

                    $.extend(options, {
                        filter: "Week_Begin ge " + fbegin + " and Week_End le " + fend
                    });
                    this.fetch(options);
                },
                formatSPdateString: function(date) {
                    date = new Date(date);
                    return "datetime'" + date.toISOString() + "'";
                },
                aggregate: function(attribute, operation, endDate, startDate) {
                    return this.reduce(function(memo, model) {
                        if ((model.get('Operations') == operation) &&
                            (model.get('Week_End') <= endDate) &&
                            (startDate ? (model.get('Week_Begin') >= startDate) : true)) {
                            memo += model.get(attribute);
                        }
                        return memo;
                    }, 0);
                }
            });

            // API
            var API = {
                getItems: function(date) {
                    var defer = $.Deferred();
                    var options = date ? date : {};

                    $.extend(options, {
                        success: function() {
                            defer.resolve(Models.salesCollection);
                        },
                        error: function(err) {
                            defer.resolve(err);
                        }
                    });

                    if (Models.salesCollection === undefined) {
                        Models.salesCollection = new Models.SalesCollection();
                        Models.salesCollection.fetchYTD(options);
                    }
                    else if (date) {
                        Models.salesCollection.fetchYTD(options);
                    }
                    else {
                        defer.resolve(Models.salesCollection);
                    }

                    return defer.promise();
                },
                getFilteredItems: function(date) {
                    if (Models.salesCollection === undefined) {
                        initItems(date);
                    }
                    if (Models.filteredCollection === undefined) {
                        Models.filteredCollection = new VirtualCollection(Models.salesCollection);
                        Models.filteredCollection.comparator = 'Operations';
                    }
                    return Models.filteredCollection;
                },
                getEntry: function(id) {
                    var entry = new Models.SalesItem({
                        Id: id
                    });
                    entry.fetch();
                    return entry;
                },
                updateSales: function(options) {
                    if (Models.salesCollection) {
                        Models.salesCollection.fetchYTD(options);
                    }
                },
                destroy: function() {
                    if (Models.salesCollection) {
                        delete Models.salesCollection;
                    }
                    if (Models.filteredCollection) {
                        delete Models.filteredCollection;
                    }
                }
            };

            // Event Handlers
            this.intercom.reply('models', function(date) {
                return API.getItems(date);
            }, this);

            this.intercom.reply('models:filtered', function(date) {
                return API.getFilteredItems(date);
            }, this);

            this.intercom.comply('models:update', function(options) {
                API.updateSales(options);
            }, this);

            this.intercom.reply('entry', function(id) {
                return API.getEntry(id);
            }, this);

            this.intercom.reply('entry:new', function() {
                return new Models.SalesItem();
            }, this);

            this.intercom.comply('destroy', function() {
                API.destroy();
            }, this);
        },

        initialize: function() {
            // Radio
            this.channel = Backbone.Radio.channel('weekly');
            this.intercom = Backbone.Radio.channel('weekly.sales');
        },

        onStop: function() {
            this.intercom.command('destroy');

            this.intercom.stopReplying(null, null, this);
            this.intercom.stopComplying(null, null, this);
        }
    });

    return App.Weekly.Sales.Models;
});