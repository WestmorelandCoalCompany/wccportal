define([
    'app',
    'apps/weekly/entities/date/models'
], function (App, Models) {
    App.module('Weekly.Entities.Date.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'channel': {
                        name: 'weekly:api',
                        events: {
                            comply: {
                                'date:monthly': 'monthly',
                                'date:weekly': 'weekly'
                            },
                            reply: {
                                'date:get': 'get',
                                'date:next': 'next',
                                'date:prev': 'previous',
                                'date:update': 'update'
                            }
                        }
                    }
                },



                //  Initializers
                //  ------------

                init: function() {
                    // Initialize the date model
                    this.initModel('date',
                        Models.Date,
                        {events: {'change': 'notifyChangeDate'}},
                        {date: M.getDayOfWeek(new Date(), 1, -1)});
                    this.notifyChangeDate();
                },



                //  API Methods
                //  -----------

                // GET date
                get: function(options) {
                    return this.models.get('date');
                },

                // UPDATE date to the next week
                next: function() {
                    var m = this.models.get('date'),
                        d = m.get('date');
                    m.update(M.getDayOfWeek(d, 1, 1));
                },

                // CHANGE date mode to monthly
                monthly: function() {
                    this.mode('monthly');
                },

                // UPDATE date to the previous week
                previous: function() {
                    var m = this.models.get('date'),
                        d = m.get('date');
                    m.update(M.getDayOfWeek(d, 1, -1));
                },

                // UPDATE date
                update: function(date) {
                    var m = this.models.get('date');
                    m.update(date);
                },

                // CHANGE date mode to weekly
                weekly: function() {
                    this.mode('weekly');
                },



                //  Notifications
                //  -------------

                // NOTIFY date changed
                notifyChangeDate: function() {
                    this.channel.trigger('changed:date', this.models.get('date'));
                },

                // NOTIFY mode changed
                notifyChangeMode: function() {
                    this.channel.trigger('changed:date:mode', this.models.get('date'));
                },



                //  Internal Methods
                //  ----------------

                // Set the date model mode (weekly or monthly)
                mode: function(mode) {
                    var date = this.models.get('date');
                    date.mode = mode;
                    this.update(date.get('date'));
                }
            });
        }
    });

    return App.Weekly.Entities.Date.API;
});