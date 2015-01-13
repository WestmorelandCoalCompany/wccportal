define([
    'app',
    'apps/utils/sharepoint/metadata',
    'backbone.picky'
], function (App, Metadata) {
    App.module('Main.Navigation.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Radio
            Models.channel = Backbone.Radio.channel('global');

            // Models
            Models.MenuItem = Backbone.Selectable.Model.extend({});

            // Collections
            Models.MenuCollection = Backbone.Selectable.Collection.extend({
                model: Models.MenuItem,
                fetch: function () {
                    var self = this;
                    var req = Models.channel.request('utils:sharepoint:metadata:fetch');
                    req.done(function (res) {
                        self.reset(res);
                    });
                    req.fail(function (res) {
                        console.log(res);
                    });
                }
            });

            // Internal Methods
            var API = {
                getMenuCollection: function() {
                    if (Models.menuCollection === undefined) {
                        Models.menuCollection = new Models.MenuCollection();
                        Models.menuCollection.fetch();
                    }
                    return Models.menuCollection;
                }
            };

            // Event Handlers
            Models.channel.reply('models:main:navigation', function() {
                return API.getMenuCollection();
            });
        }
    });

    return App.Main.Navigation.Models;
});