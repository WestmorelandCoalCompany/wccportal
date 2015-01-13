define([
    'app',
    'backbone.sp',
    'backbone.picky'
], function (App) {
    App.module('Main.Entities.Operations.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Operations
            Models.Operation = Backbone.SP.Item.extend({
                site: '/',
                list: 'Operations',

                initialize: function() {
                    var s = new Backbone.Picky.Selectable(this);
                    _.extend(this, s);
                }
            });

            Models.Operations = Backbone.SP.List.extend({
                model: Models.Operation,
                initialize: function() {
                    var ss = new Backbone.Picky.SingleSelect(this);
                    _.extend(this, ss);
                },
                fetch: function(options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*',
                        filter: "f8ie eq 'U.S. Coal'"
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });
        }
    });

    return App.Main.Entities.Operations.Models;
});