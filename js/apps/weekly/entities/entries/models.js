define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('Weekly.Entities.Entries.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            var siteURL = '/operations/';

            Models.Entry = Backbone.SP.Item.extend({
                site: siteURL,
                list: 'Weekly',

                defaults: {
                    '__metadata': {
                        type: "SP.Data.WeeklyListItem"
                    }
                },

                parse: function(res, options) {
                    options || (options = {});
                    if (options.deleted || options.updated) return this.attributes;

                    // parse dates
                    _.each(['Week_Begin', 'Modified', 'Created'], function(date) {
                        if (res[date]) res[date] = new Date(res[date]);
                    });

                    return res;
                }
            });

            Models.Entries = Backbone.SP.List.extend({
                model: Models.Entry,
                fetch: function(options) {
                    options || (options = {});
                    $.extend(options, {
                        select: 'Author/Title,Editor/Title,*',
                        expand: 'Author/Title,Editor/Title'
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });
        }
    });

    return App.Weekly.Entities.Entries.Models;
});