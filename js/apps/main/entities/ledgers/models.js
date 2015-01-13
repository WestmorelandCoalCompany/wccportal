define([
    'app',
], function (App) {
    App.module('Main.Entities.Ledgers.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            Models.Ledger = Backbone.Model.extend({
                urlRoot: 'http://wccportal-test/-/_vti_bin/custom/data.svc/ledgers'
            });

            Models.Ledgers = Backbone.Collection.extend({
                model: Models.Ledger,
                url: '_vti_bin/custom/data.svc/ledgers'
            });
        }
    });

    return App.Main.Entities.Ledgers.Models;
});