define([
    'app',
    'apps/weekly/sales/models',
    'apps/weekly/sales/show/views'
], function (App) {
    App.module('Weekly.Sales.Show', {
        define: function (Show, App, Backbone, Marionette, $, _) {
            Show.Controller = Marionette.Controller.extend({
                // Configuration
                appChannel: Backbone.Radio.channel('weekly'),
                channel: Backbone.Radio.channel('weekly.sales'),
                intercom: Backbone.Radio.channel('weekly.sales.show'),

                initialize: function () {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    console.log('initializing sales.show.controller');
                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn(this.intercom.channelName);
                    }

                    this.intercom.comply('list:entries', function() {
                        App.navigate('weekly/sales');
                        this.showList();
                    }, this);

                    this.appChannel.on('changed:date', function(date) {
                        this.showList(date);
                    }, this);
                },

                onDestroy: function () {
                    this.intercom.stopComplying(null, null, this);
                    this.appChannel.off(null, null, this);
                },

                // Main Methods
                init: function() {
                    this.showList();
                },

                showList: function(date) {
                    // Add Loading View

                    // get the current date range
                    var options;
                    if (!arguments.length) {
                        date = this.appChannel.request('current:date:range');
                    }
                    options = {date: date.get('date')};

                    // get the collection
                    var xhr = this.channel.request('models', options),
                        filteredCollection = this.channel.request('models:filtered');

                    $.when(xhr).done(function(collection) {
                        // update the filter
                        filteredCollection.updateFilter(function(item) {
                            var weekStart = date.get('startDate'),
                                itemStart = item.get('Week_Begin'),
                                weekEnd = date.get('endDate'),
                                itemEnd = item.get('Week_End');

                            return itemStart >= weekStart && itemEnd <= weekEnd;
                        });

                        // perform aggregations
                        filteredCollection.each(function(model) {
                            _.each(['Actual_Tons','Budget_Tons','Forecast_Tons'], function(label, i) {
                                // MTD
                                var mtdLabel = 'MTD_' + label;
                                model.set(mtdLabel, collection.aggregate(label, model.get('Operations'),
                                    model.get('Week_End'), new Date(model.get('Week_End').getFullYear(),
                                        model.get('Week_End').getMonth(), 1)));

                                // YTD
                                var ytdLabel = 'YTD_' + label;
                                model.set(ytdLabel, collection.aggregate(label, model.get('Operations'),
                                    model.get('Week_End')));
                            });
                        });

                        // show the view if applicable
                        var view = new App.Weekly.Sales.Show.Views.ListView({
                            collection: filteredCollection
                        });
                        App.Weekly.Layout.contentRegion.show(view);
                    });
                }
            });
        }
    });

    return App.Weekly.Sales.Show;
});