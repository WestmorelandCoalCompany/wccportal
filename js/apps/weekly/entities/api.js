define([
    'app',
    'apps/weekly/entities/date/api',
    'apps/weekly/entities/entries/api'
], function (App, Date, Entries) {
    App.module('Weekly.Entities.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                init: function() {
                    this.initController('date', Date.API);
                    this.initController('entries', Entries.API);
                }
            });
        }
    });

    return App.Weekly.Entities.API;
});