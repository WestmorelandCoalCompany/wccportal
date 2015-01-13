define([
    'app',
    'd3',
    'SP.userprofiles',
    'backbone.sp'
], function (App, d3) {
    App.module('Weekly.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // SharePoint List Root URL


            // Date
            Models.DateItem = Backbone.Model.extend({
                initialize: function(options) {
                    options || (options = {});
                    var date = options.date,
                        today = new Date();
                    if (!date) date = new Date(today.setDate(today.getDate()-7));
                    this.updateDate(date);
                },
                updateDate: function(date) {
                    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
                    this.set({
                        date: d,
                        start: this.getDateOfWeek(d, 1, 0),
                        end: this.getDateOfWeek(d, 7, 0)
                    });
                    this.trigger('change');
                },
                getDateOfWeek: function(date, day, week) {
                    week = week === undefined ? 1 : week;
                    date = new Date(date);
                    var o = date.getDate(),
                        d = new Date(date.setDate(o + (7*week))),
                        a = day - 7,
                        b = day,
                        day = d.getDay(),
                        diff = d.getDate() - day + (day == 0 ? a : b);
                    return new Date(d.setDate(diff));
                }
            });

            // Inventory
            Models.Inventory = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'Weekly Inventory',

                parse: function(res, options) {
                    if (options.deleted) return this.attributes;
                    _.each(['Week_Begin', 'Week_End', 'Modified', 'Created'], function(date) {
                        if (res[date]) res[date] = new Date(res[date]);
                    });
                    return res;
                }
            });

            Models.InventoryCollection = Backbone.SP.List.extend({
                model: Models.Inventory,
                fetch: function (options) {
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });

            // Navigation Menu
            Models.MenuItem = Backbone.Model.extend({
                initialize: function () {
                    var selectable = new Backbone.Picky.Selectable(this);
                    _.extend(this, selectable);
                }
            });

            Models.MenuCollection = Backbone.Collection.extend({
                model: Models.MenuItem,
                initialize: function () {
                    var singleSelect = new Backbone.Picky.SingleSelect(this);
                    _.extend(this, singleSelect);

                    this.reset({
                            name: 'Safety',
                            url: 'weekly/safety',
                            event: 'weekly:safety',
                            title: 'Weekly Safety Updates'
                        },
                        {
                            name: 'Sales',
                            url: 'weekly/sales',
                            event: 'weekly:sales',
                            title: 'Weekly Sales Updates'
                        },
                        {
                            name: 'Inventory',
                            url: 'weekly/inventory',
                            event: 'weekly:inventory',
                            title: 'Weekly Sales Updates'
                        })
                }
            });

            // Safety
            Models.Incident = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'Weekly Safety',

                parse: function(res, options) {
                    if (options.deleted) return this.attributes;
                    _.each(['Week_Begin', 'Week_End', 'Modified', 'Created'], function(date) {
                        if (res[date]) res[date] = new Date(res[date]);
                    });
                    return res;
                },

                aggregate: function(options) {
                    var data = this.collection.aggregate(options);
                    this.options['aggregation'] = data;
                }
            });

            Models.Incidents = Backbone.SP.List.extend({
                model: Models.Incident,
                fetch: function (options) {
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },

                aggregate: function(options) {
                    var data = d3.nest()
                        .key(function(model) {return model.get('Labor_Category')})
                        .key(function(model) {return model.get('Incident_Category')})
                        .rollup(function(l) {
                            return l.length;
                        }).entries(this.filter(function(model) {
                            var x = model.get('Week_Begin') >= options.start,
                                y = model.get('Week_End') <= options.end,
                                z = model.get('Operations') == options.operation;
                            return x && y && z;
                        }));
                    return data;
                }
            });

            //  Sales
            //  -----
            Models.Sales = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'Weekly Sales',

                parse: function(res, options) {
                    if (options.deleted) return this.attributes;
                    // parse dates
                    _.each(['Week_Begin', 'Week_End', 'Modified', 'Created'], function(date) {
                        if (res[date]) res[date] = new Date(res[date]);
                    });
                    return res;
                },

                aggregate: function() {
                    var operation = this.get('Operations'),
                        end = this.get('Week_End'),
                        mstart = new Date(new Date(end).setDate(1)),
                        ystart = new Date(end.getFullYear(),0,1,0 ,0,0);
                    _.each(['Actual_Tons','Budget_Tons','Forecast_Tons'], function(attr) {
                        var label;
                        // MTD
                        label = 'MTD_' + attr;
                        this.set(label, this.collection.rollup(attr, operation, end, mstart));

                        // YTD
                        label = 'YTD_' + attr;
                        this.set(label, this.collection.rollup(attr, operation, end, ystart));
                    }, this);
                }
            });

            Models.SalesCollection = Backbone.SP.List.extend({
                model: Models.Sales,
                fetch: function (options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },

                aggregate: function() {
                    this.each(function(model) {
                        model.aggregate();
                    }, this);
                },

                rollup: function(attribute, operation, end, start) {
                    return this.reduce(function (memo, model) {
                        if ((model.get('Operations') == operation) &&
                            (model.get('Week_End') <= end) &&
                            (start ? (model.get('Week_Begin') >= start) : true)) {
                            memo += model.get(attribute);
                        }
                        return memo;
                    }, 0);
                }
            });

            // Title
            Models.HeaderItem = Backbone.Model.extend({});
        }
    });

    return App.Weekly.Models;
});