define([
    'app'
], function (App) {
    App.module('Weekly.DateMenu.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Radio
            Models.intercom = Backbone.Radio.channel('weekly.datemenu');

            // Models
            Models.DateItem = Backbone.Model.extend({
                updateDate: function(date) {
                    this.set({
                        date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
                        startDate: get_monday(date),
                        endDate: get_next_sunday(date)
                    });
                }
            });

            // Internal Methods
            var get_sunday = function(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -7 : 0);
                return new Date(d.setDate(diff));
            };

            var get_next_sunday = function(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? 0 : 7);
                return new Date(d.setDate(diff));
            };

            var get_monday = function(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -6 : 1);
                return new Date(d.setDate(diff));
            };

            var get_monday_of_last_week = function(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -12 : -6);
                return new Date(d.setDate(diff));
            };

            var get_friday = function(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -2 : 5);
                return new Date(d.setDate(diff));
            };

            var get_saturday = function(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -1 : 6);
                return new Date(d.setDate(diff));
            };

            // API
            var API = {
                getDateItem: function() {
                    if (Models.dateItem === undefined) {
                        Models.dateItem = new Models.DateItem();
                        var today = new Date(),
                            lastWeek = get_monday_of_last_week(today);
                        Models.dateItem.updateDate(lastWeek);
                    }
                    return Models.dateItem;
                }
            };

            // Event Handlers
            Models.intercom.reply('models', function() {
                return API.getDateItem();
            });
        }
    });

    return App.Weekly.DateMenu.Models;
});