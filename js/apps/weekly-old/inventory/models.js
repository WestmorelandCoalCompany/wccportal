define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('Weekly.Inventory.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Module Variables
            var root = '/Operations';

            // Models
            Models.InventoryItem = Backbone.SP.Item.extend({
                site: root,
                list: 'Weekly Inventory',
                defaults: {
                    __metadata: {
                        type: "SP.Data.Weekly_x0020_InventoryListItem"
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
                },

                validate: function(attrs, options) {
                    // Validate dates
/*                    var oneDay = 24*60*60*1000;
                    if (Math.round(Math.abs((attrs.Week_End.getTime() - attrs.Week_Begin.getTime())/oneDay)) > 7) {
                        return 'Date range cannot exceed 7 days.'
                    }*/
                }
            });

            // Collections
            Models.InventoryCollection = Backbone.SP.List.extend({
                model: Models.InventoryItem,
                fetch: function(options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                fetchCurrentYear: function(options) {
                    options || (options = {});
                    var today  = new Date(),
                        begin = new Date(today.getFullYear(), 0, 1),
                        end = new Date(today.setDate(today.getDate() - today.getDay() + 7)),
                        fend = this.formatSPdateString(end),
                        fbegin = this.formatSPdateString(begin);

                    $.extend(options, {
                        filter: "Week_Begin ge " + fbegin
                    });

                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                formatSPdateString: function(date) {
                    date = new Date(date);
                    return "datetime'" + date.toISOString() + "'";
                }
            });

            // API
            var API = {
                getInventory: function() {
                    if (Models.inventoryCollection === undefined) {
                        Models.inventoryCollection = new Models.InventoryCollection();
                        Models.inventoryCollection.fetchCurrentYear();
                    }
                    if (Models.filteredCollection === undefined) {
                        Models.filteredCollection = new VirtualCollection(Models.inventoryCollection);
                        Models.filteredCollection.comparator = 'Operations';
                    }
                    return Models.filteredCollection;
                },
                getUnfiltered: function() {
                    if (Models.inventoryCollection === undefined) {
                        Models.inventoryCollection = new Models.InventoryCollection();
                        Models.inventoryCollection.fetchCurrentYear();
                    }
                    return Models.inventoryCollection;
                },
                getEntry: function(id) {
                    var entry = new Models.InventoryItem({
                        Id: id
                    });
                    entry.fetch();
                    return entry;
                },
                updateInventory: function() {
                    if (Models.inventoryCollection) {
                        Models.inventoryCollection.fetchCurrentYear();
                    }
                },
                destroy: function() {
                    if (Models.inventoryCollection) {
                        delete Models.inventoryCollection;
                    }
                    if (Models.filteredCollection) {
                        delete Models.filteredCollection;
                    }
                }
            };

            // Event Handlers
            this.intercom.reply('models', function() {
                return API.getInventory();
            }, this);

            this.intercom.reply('models:all', function() {
                return API.getUnfiltered();
            }, this);

            this.intercom.comply('models:update', function() {
                API.updateInventory();
            }, this);

            this.intercom.reply('entry', function(id) {
                return API.getEntry(id);
            }, this);

            this.intercom.reply('entry:new', function() {
                return new Models.InventoryItem();
            }, this);

            this.intercom.comply('destroy', function() {
                API.destroy();
            }, this)
        },

        initialize: function() {
            // Radio
            this.intercom = Backbone.Radio.channel('weekly.inventory');
            this.channel = Backbone.Radio.channel('weekly');
        },

        onStop: function() {
            // Destroy all collections and models
            this.intercom.command('destroy');

            // Unbind Events
            this.intercom.stopReplying(null, null, this);
            this.intercom.stopComplying(null, null, this);
        }
    });

    return App.Weekly.Inventory.Models;
});