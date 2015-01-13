define([
    'app',
    'backbone.sp',
    'backbone.picky',
], function (App) {
    App.module('Apps.Weekly.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // ### Module Variables
            var siteURL = '/operations/';

            // ### Models
            Models.HeaderItem = Backbone.Model.extend({});

            Models.MenuItem = Backbone.Model.extend({
                initialize: function () {
                    var selectable = new Backbone.Picky.Selectable(this);
                    _.extend(this, selectable);
                }
            });

            Models.Incident = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'WeeklySafety'
            });

            Models.Inventory = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'WeeklyInventory'
            });

            Models.Sales = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'WeeklySales'
            });

            // ### Collections
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

            Models.IncidentCollection = Backbone.SP.List.extend({
                model: Models.Incident,
                fetch: function (options) {
                    $.extend(options, {
                        select: 'Id, WeekBegin, WeekEnd, IncidentCategoryValue, ' +
                            'LaborCategoryValue, Comments'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                parse: function (res) {
                    return Backbone.SP.List.prototype.parse.call(this, res);
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

            Models.SalesCollection = Backbone.SP.List.extend({
                model: Models.Inventory,
                fetch: function (options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });
            // ### Internal Methods
            var initializeHeaderItem = function () {
                Models.headerItem = new Models.HeaderItem({
                    title: 'Weekly Updates'
                });
            };

            var initializeOperationItems = function () {
                Models.operationCollection = new Models.MenuCollection([
                    {name: 'Beulah'},
                    {name: 'Jewett'},
                    {name: 'Kemmerer'},
                    {name: 'Savage'},
                    {name: 'WECo'},
                    {name: 'WRI'},
                    {name: 'ROVA'},
                    {name: 'Corporate'}
                ]);
                Models.operationCollection.select(Models.operationCollection.at(0));
            };

            var initializeMenuItems = function () {
                Models.menuCollection = new Models.MenuCollection([
                    {
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
                    }
                ]);
            };

            // ### API
            var API = {
                getHeaderItem: function() {
                    if (Models.headerItem === undefined) {
                        initializeHeaderItem();
                    }
                    return Models.headerItem;
                },
                getMenuItems: function () {
                    if (Models.menuCollection === undefined) {
                        initializeMenuItems();
                    }
                    return Models.menuCollection;
                },
                getOperations: function () {
                    if (Models.operationCollection === undefined) {
                        initializeOperationItems();
                    }
                    return Models.operationCollection;
                },
                getIncidentCollection: function () {
                    if (Models.incidentCollection === undefined) {
                        Models.incidentCollection = new Models.IncidentCollection();
                    }
                    return Models.incidentCollection;
                },
                getInventoryCollection: function () {
                    return new Models.InventoryCollection();
                }
            };

            // ### Event Handling
            App.reqres.setHandler('weekly:models:headeritem', function () {
                return API.getHeaderItem();
            });

            App.reqres.setHandler('weekly:models:menuitems', function () {
                return API.getMenuItems();
            });

            App.reqres.setHandler('weekly:models:operations', function() {
                return API.getOperations();
            });

            App.reqres.setHandler('weekly:models:incidents', function () {
                return API.getIncidentCollection();
            });

            App.reqres.setHandler('weekly:models:inventory', function () {
                return API.getInventoryCollection();
            });
        }
    });

    return;
})