define([
    'app',
    'hbs!apps/weekly/dateMenu/templates/menu'
], function (App, menuTpl) {
    App.module('Weekly.DateMenu.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            // Radio
            Views.intercom = Backbone.Radio.channel('weekly.datemenu');

            Views.MenuView = Marionette.ItemView.extend({
                // Configuration
                template: menuTpl,
                tagName: 'form',
                className: 'navbar-form',
                attributes: {
                    'role': 'search'
                },
                templateHelpers: {
                    formattedDate: function() {
                        return format_date(this.date);
                    }
                },

                // UI
                ui: {
                    datePicker: '#weekly-date-control',
                    update: '#weekly-date-update'
                },

                // Events
                events: {
                    'click @ui.update': 'updateDate'
                },

                // Event Handlers
                updateDate: function(e) {
                    e.preventDefault();
                    Views.intercom.command('change:date', this.ui.datePicker.datepicker('getDate'));
                },

                // Internal Methods
                onRender: function() {
                    this.ui.datePicker.datepicker({
                        orientation: "top right",
                        daysOfWeekDisabled: "0,6",
                        calendarWeeks: true,
                        autoclose: true,
                        todayHighlight: true
                    });
                    this.ui.datePicker.datepicker('setDate', this.model.get('date'));
                }
            });

            // Internal Methods
            var format_date = function(d) {
                d = new Date(d);
                return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
            };
        }
    });

    return App.Weekly.DateMenu.Views;
});