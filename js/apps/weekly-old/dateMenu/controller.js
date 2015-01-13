define([
    'app',
    'apps/weekly/dateMenu/models',
    'apps/weekly/dateMenu/views'
], function (App) {
    App.module('Weekly.DateMenu', {
        define: function (DateMenu, App, Backbone, Marionette, $, _) {
            DateMenu.Controller = Marionette.Controller.extend({
                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly.datemenu');
                    }

                    this.intercom.comply('change:date', function(date) {
                        this.changeDate(date);
                    }, this);

                    this.channel.reply('current:date:range', function() {
                        return this.getStartRange();
                    }, this);

                    this.showDateMenu();
                    this.changeDate();
                },

                channel: Backbone.Radio.channel('weekly'),
                intercom: Backbone.Radio.channel('weekly.datemenu'),

                showDateMenu: function() {
                    var model = this.intercom.request('models');
                    var view = new App.Weekly.DateMenu.Views.MenuView({
                        model: model
                    });
                    App.Weekly.Layout.dateMenuRegion.show(view);
                },

                changeDate: function(date) {
                    var model = this.intercom.request('models');
                    if (arguments.length != 0) {
                        date = new Date(date);
                        model.updateDate(date);
                    }
                    this.channel.trigger('changed:date', model);
                },

                getStartRange: function() {
                    var model = this.intercom.request('models');
                    return model;
                }
            });
        }
    });

    return App.Weekly.DateMenu;
});