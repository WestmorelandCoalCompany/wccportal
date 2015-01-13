define([
    'app'
], function (App) {
    App.module('Weekly.Entities.Date.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            Models.Date = Backbone.Model.extend({
                initialize: function(options) {
                    options || (options = {});
                    var d = options.date || new Date();
                    this.update(d);
                },
                mode: 'weekly',
                update: function(date) {
                    // if mode is weekly, set date range to current week
                    // else set date range to current month
                    var d = new Date(date),
                        start = (this.mode != 'weekly') ? new Date(d.getFullYear(), d.getMonth(), 1) : M.getDayOfWeek(d, 1, 0),
                        end = (this.mode != 'weekly') ? new Date(d.getFullYear(), d.getMonth() + 1, 0) : M.getDayOfWeek(d,0,1);
                    this.set({
                        date: d,
                        start: start,
                        end: end
                    });
                }
            });
        }
    });

    return App.Weekly.Entities.Date.Models;
});