define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('Weekly.Safety.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Module Variables
            var root = '/Operations';

            // Safety Incident
            Models.Incident = Backbone.SP.Item.extend({
                site: root,
                list: 'Weekly Safety',
                defaults: {
                    __metadata: {
                        type: "SP.Data.Weekly_x0020_SafetyListItem"
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

            Models.Incidents = Backbone.SP.List.extend({
                model: Models.Incident,
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
        }
    });

    return App.Weekly.Safety.Models;
});