define([
    'app',
], function (App) {
    App.module('Weekly.MainMenu.Models', {
        define: function(Models, App, Backbone, Marionette, $, _) {
            // Radio
            Models.channel = Backbone.Radio.channel('weekly.mainmenu');

            // Models
            Models.MenuItem = Backbone.Selectable.Model.extend({});

            // Collections
            Models.MenuCollection = Backbone.Selectable.Collection.extend({
                model: Models.MenuItem,

                fetch: function() {
                    this.reset([
                        {
                            name: 'Safety',
                            event: 'weekly:navigate:safety'
                        },
                        {
                            name: 'Sales',
                            event: 'weekly:navigate:sales'
                        },
                        {
                            name: 'Inventory',
                            event: 'weekly:navigate:inventory'
                        }
                        //{
                        //    name: 'Edit',
                        //    event: 'weekly:edit',
                        //    items: [
                        //        {
                        //            name: 'Safety Data',
                        //            url: 'weekly:edit:safety'
                        //        },
                        //        {
                        //            name: 'Sales Data',
                        //            url: 'weekly:edit:sales'
                        //        },
                        //        {
                        //            name: 'Inventory Data',
                        //            url: 'weekly:edit:inventory'
                        //        }
                        //    ]
                        //}
                    ]);
                }
            });

            // Internal Methods

            // API
            var API = {
                fetchMenuCollection: function () {
                    if (Models.menuCollection === undefined) {
                        Models.menuCollection = new Models.MenuCollection();
                        Models.menuCollection.fetch();
                    }
                    return Models.menuCollection;
                }
            };

            // Event Handlers
            Models.channel.reply('models:mainmenu', function() {
                return API.fetchMenuCollection();
            });
        }
    });

    return App.Weekly.MainMenu.Models;
});