define([
    'app',
    'apps/weekly/inventory/models',
    'apps/weekly/inventory/show/views'
], function (App) {
    App.module('Weekly.Inventory.Show', {
        define: function (Show, App, Backbone, Marionette, $, _) {
            Show.Controller = Marionette.Controller.extend({
                // Configuration
                appChannel: Backbone.Radio.channel('weekly'),
                channel: Backbone.Radio.channel('weekly.inventory'),
                intercom: Backbone.Radio.channel('weekly.inventory.show'),

                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly.inventory.show');
                    }

                    this.intercom.comply('list:entries', function() {
                        App.navigate('weekly/inventory');
                        this.showList();
                        this.updateFilter();
                    }, this);

                    this.appChannel.on('changed:date', function() {
                        this.updateFilter();
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.stopComplying(null, null, this);
                },

                // Main Methods
                showList: function() {
                    var collection = this.channel.request('models');
                    var view = new App.Weekly.Inventory.Show.Views.ShowView({
                        collection: collection
                    });
                    App.Weekly.Layout.contentRegion.show(view);
                },

                updateFilter: function() {
                    var collection = this.channel.request('models'),
                    //operation = this.channel.request('current:operation'),
                        date = this.appChannel.request('current:date:range');

                    collection.updateFilter(function(item) {
                        var weekStart = date.get('startDate'),
                            itemStart = item.get('Week_Begin'),
                            weekEnd = date.get('endDate'),
                            itemEnd = item.get('Week_End');

                        return itemStart >= weekStart && itemEnd <= weekEnd;
                    });
                }
            });
        }
    });

    return App.Weekly.Inventory.Show;
});