define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('Weekly.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            var siteURL = '/operations/';

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

            Models.WeeklyItem = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'Weekly',

                defaults: {
                    '__metadata': {
                        type: "SP.Data.WeeklyListItem"
                    }
                },

                parse: function(res, options) {
                    options || (options = {});
                    if (options.deleted || options.updated) return this.attributes;

                    // parse dates
                    _.each(['Week_Begin', 'Modified', 'Created'], function(date) {
                        if (res[date]) res[date] = new Date(res[date]);
                    });

                    return res;
                }
            });

            Models.WeeklyCollection = Backbone.SP.List.extend({
                model: Models.WeeklyItem,
                fetch: function(options) {
                    options || (options = {});
                    $.extend(options, {
                        select: 'Author/Title,Editor/Title,*',
                        expand: 'Author/Title,Editor/Title'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });
        }
    });

    return App.Weekly.Models;
});