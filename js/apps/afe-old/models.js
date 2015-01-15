define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('AFE.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Work Orders
            Models.CapitalWorkOrder = Backbone.Model.extend({
                urlRoot: 'http://wccportal-test/-/_vti_bin/custom/data.svc/wos'
            });

            Models.CapitalWorkOrders = Backbone.Collection.extend({
                model: Models.CapitalWorkOrder,
                url: '_vti_bin/custom/data.svc/capitalwos',
                fetch: function(options) {
                    options || (options = {});
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });
            // AFE Items
            Models.CapitalWorkOrderAmount = Backbone.Model.extend({
                urlRoot: 'http://wccportal-test/-/_vti_bin/custom/data.svc/capitalwoamounts',
                defaults: {
                    Amount_Type: 'Variance',
                    Amount: null
                },
                parse: function(res, options) {
                    options || (options = {});
                    if (options.deleted) return this.attributes;
                    if (res.Date) res.Date = new Date(res.Date);
                    return res;
                }
            });

            Models.CapitalWorkOrderAmounts = Backbone.Collection.extend({
                model: Models.CapitalWorkOrderAmount,
                url: '_vti_bin/custom/data.svc/capitalwoamounts',

                fetch: function(options) {
                    options || (options = {});
                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                getTotalByWhere: function(attrs) {
                    return _.reduce(_.map(this.where(attrs), function(model) {return model.get('Amount')}), function(memo, val) {
                        if (val) memo += val;
                        return memo;
                    }, 0);
                }
            });

            // Capital Project
            Models.Project = Backbone.SP.Item.extend({
                site: '/',
                list: 'Capital Projects',

                defaults: {
                    Submitted: false,
                    __metadata: {
                        type: "SP.Data.Capital_x0020_ProjectsListItem"
                    }
                },

                parse: function(res, options) {
                    if (options.deleted) {
                        return this.attributes;
                    }
                    if (res.Notes) res.Notes = $(res.Notes).text();
                    return res;
                }
            });

            Models.Projects = Backbone.SP.List.extend({
                initialize: function(models, options) {
                    options || (options = {});
                    if (options.currentUser) this.currentUser = options.currentUser;
                },
                model: Models.Project,
                fetch: function (options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });

            // Capital Amount
            Models.Amount = Backbone.SP.Item.extend({
                site: '/',
                list: 'Capital Amounts',

                defaults: {
                    __metadata: {
                        type: "SP.Data.Capital_x0020_AmountsListItem",
                        Submitted: false
                    }
                },

                parse: function(res, options) {
                    if (options.deleted) return this.attributes;

                    _.each(['Date', 'Modified', 'Created'], function(attr) {
                        if (res[attr]) {
                            res[attr] = new Date(res[attr]);
                        }
                    });

                    return res;
                }
            });

            Models.Amounts = Backbone.SP.List.extend({
                model: Models.Amount,
                fetch: function (options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                getTotalByYear: function(year) {
                    return _.reduce(this.map(function(model) {
                        if (model.get('Date').getFullYear() == year) return model.get('Amount');
                        return 0;
                    }), function(memo, val) {
                        if (val) memo += val;
                        return memo;
                    }, 0);
                },
                getTotalByWhere: function(attrs) {
                    return _.reduce(_.map(this.where(attrs), function(model) {return model.get('Amount')}), function(memo, val) {
                        if (val) memo += val;
                        return memo;
                    }, 0);
                }
            });

            // Tasks
            Models.Task = Backbone.SP.Item.extend({
                site: '/',
                list: 'AFE Tasks',
                parse: function (res, options) {
                    if (options.deleted) {
                        return this.attributes;
                    }
                    else {
                        // parse dates
                        _.each(['DueDate', 'StartDate', 'Modified', 'Created'], function (attr) {
                            if (res[attr]) {
                                res[attr] = new Date(res[attr]);
                                if (attr == 'DueDate') {
                                    res['dueIn'] = -1 * daysBetween(res[attr], new Date());
                                }
                            }
                        });
                        return res;
                    }
                }
            });

            Models.Tasks = Backbone.SP.List.extend({
                model: Models.Task,
                fetch: function (options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*'
                    });
                    if (options.userID) {
                        $.extend(options, {
                            filter: "AssignedTo/Id eq " + options.userID + " and Status ne 'Completed'"
                        });
                    }
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });

            // Event
            Models.Event = Backbone.SP.Item.extend({
                site: '/',
                list: 'WorkflowHistory'
            });

            Models.Events = Backbone.SP.List.extend({
                model: Models.HistoryEntry,
                fetch: function (options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*',
                        filter: "WorkflowHistoryParentInstance eq '" + options.projectID + "'"
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });

            // Module methods
            var treatAsUTC = function(date) {
                var result = new Date(date);
                result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
                return result;
            };

            var daysBetween = function(startDate, endDate) {
                var millisecondsPerDay = 24 * 60 * 60 * 1000;
                return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
            };
        }
    });

    return App.AFE.Models;
});