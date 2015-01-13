define([
    'app',
    'apps/weekly/opMenu/models',
    'apps/weekly/opMenu/views'
], function (App) {
    App.module('Weekly.OpMenu', {
        define: function (OpMenu, App, Backbone, Marionette, $, _) {
            OpMenu.Controller = Marionette.Controller.extend({
                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn(this.intercom.channelName);
                    }

                    this.intercom.comply('change:operation', function(operation) {
                        this.changeOperation(operation);
                    }, this);

                    this.channel.reply('current:operation', function() {
                        return this.getCurrentOp();
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.stopComplying('change:operation')
                },

                channel: Backbone.Radio.channel('weekly'),
                intercom: Backbone.Radio.channel('weekly.opmenu'),

                init: function() {
                    this.showOpMenu();
                    this.changeOperation('Beulah');
                },

                showOpMenu: function() {
                    var collection = this.intercom.request('models');
                    var view = new App.Weekly.OpMenu.Views.MenuView({
                        collection: collection
                    });
                    App.Weekly.Layout.opMenuRegion.show(view);
                },

                changeOperation: function(operation) {
                    if (!(operation instanceof Backbone.Model)) {
                        var collection = this.intercom.request('models');
                        operation = collection.findWhere({name: operation});
                    }
                    operation.collection.select(operation);
                    this.channel.trigger('changed:operation', operation);
                },

                getCurrentOp: function() {
                    var collection = this.intercom.request('models');
                    return collection.selected;
                }
            });
        }
    });

    return App.Weekly.OpMenu;
});