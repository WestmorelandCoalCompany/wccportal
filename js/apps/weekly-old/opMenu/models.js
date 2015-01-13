define([
    'app',
], function (App) {
    App.module('Weekly.OpMenu.Models', {
        define: function(Models, App, Backbone, Marionette, $, _) {
            // Models
            Models.MenuItem = Backbone.Selectable.Model.extend({});

            // Collections
            Models.MenuCollection = Backbone.Selectable.Collection.extend({
                model: Models.MenuItem,
                fetch: function () {
                    this.reset([
                        {name: 'Beulah'},
                        {name: 'Jewett'},
                        {name: 'Kemmerer'},
                        {name: 'Savage'},
                        {name: 'WECo'},
                        {name: 'WRI'},
                        {name: 'ROVA'},
                        {name: 'Corporate'}
                    ]);
                }
            });

            // API
            var API = {
                fetchMenuCollection: function () {
                    if (Models.menuCollection === undefined) {
                        Models.menuCollection = new Models.MenuCollection();
                        Models.menuCollection.fetch();
                    }
                    if (Models.menuCollection.selected === undefined) {
                        Models.menuCollection.select(Models.menuCollection.at(0));
                    }
                    return Models.menuCollection;
                }
            };

            // Event Handlers
            this.intercom.reply('models', function() {
                return API.fetchMenuCollection();
            });
        },

        initialize: function() {
            // Radio
            this.intercom = Backbone.Radio.channel('weekly.opmenu');
        },

        onStop: function() {
            // Unbind Events
            this.intercom.stopReplying(null, null, this);
        }

    });

    return App.Weekly.OpMenu.Models;
});