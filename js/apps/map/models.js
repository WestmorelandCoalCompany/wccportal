define([
    'app',
    'backbone.sp',
], function (App) {
    App.module('Map.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // ### Module Variables
            var siteURL = '/-/FPA/';

            // ### Models
            Models.Mine = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'Mines'
            });

            // ### Collections
            Models.MineCollection = Backbone.SP.List.extend({
                self: this,
                model: Models.Mine,
                fetch: function (options) {
                    $.extend(options, {
                        select: 'Title, Url, App/Title, App/Category/Title',
                        expand: 'App, App/Category',
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                },
                parse: function (res) {
                    if (res && res.results) {
                        //res.results = _.map(res.results, function (d, i, results) {
                        //    d.app = d.App.Title;
                        //    d.category = d.App.Category.Title;
                        //    return d;
                        //});
                    }
                    return Backbone.SP.List.prototype.parse.call(this, res);
                }
            });

            // ### Internal Functions

            // ### API
            var API = {
                init: function () {
                    if (MainModels.mines === undefined) {
                        MainModels.mines = new MainModels.LinkCollection();
                        MainModels.mines.fetch({
                            reset: true,
                            success: function (data) {
                                console.log('Success: ');
                            },
                            failure: function (err) {
                                console.log('Failure: ');
                            }
                        });
                    }
                    return MainModels.mines;
                }
            };

            // ### Messaging
            App.reqres.setHandler('map:models:fetch', function () {
                return API.init();
            });
        }
    });

    return;
})