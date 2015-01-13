define([
    'app',
    'apps/weekly/header/views'
], function (App) {
    App.module('Weekly.Header', {
        define: function (Header, App, Backbone, Marionette, $, _) {
            Header.Controller = Marionette.Controller.extend({
                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly.header');
                    }

                    this.channel.on('changed:subapp', function(subapp) {
                        this.updateSubApp(subapp);
                    }, this);

                    this.channel.on('changed:date', function(dateItem) {
                        this.updateDate(dateItem);
                    }, this);
                    this.showHeader();
                },

                onDestroy: function() {
                    this.channel.off(null, null, this);
                },

                channel: Backbone.Radio.channel('weekly'),
                intercom: Backbone.Radio.channel('weekly.header'),

                showHeader: function() {
                    if (this.model === undefined) {
                        this.model = new Backbone.Model();
                        this.model.set({
                            subapp: '',
                            operation: '',
                            startDate: '',
                            endDate: ''
                        });
                    }
                    var view = new App.Weekly.Header.Views.HeaderView({
                        model: this.model
                    });
                    App.Weekly.Layout.headerRegion.show(view);
                },

                updateSubApp: function(subapp) {
                    this.model.set({
                        subapp: subapp.get('name')
                    });
                },

                updateOperation: function(operation) {
                    this.model.set({
                        operation: operation.get('name')
                    });
                },

                updateDate: function(dateItem) {
                    var d1 = new Date(dateItem.get('startDate')),
                        d2 = new Date(dateItem.get('endDate')),
                        s = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear(),
                        e = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();

                    this.model.set({
                        startDate: s,
                        endDate: e
                    });
                }
            });
        }
    });

    return App.Weekly.Header;
});