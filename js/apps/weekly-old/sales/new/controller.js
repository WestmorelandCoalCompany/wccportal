define([
    'app',
    'apps/weekly/sales/new/views',
    'apps/weekly/sales/models',
], function (App, Views) {
    App.module('Weekly.Sales.New', {
        define: function (New, App, Backbone, Marionette, $, _) {
            New.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('weekly.sales'),
                intercom: Backbone.Radio.channel('weekly.sales.new'),

                initialize: function () {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn(this.intercom.channelName);
                    }
                },

                onDestroy: function () {
                    this.intercom.stopComplying(null, null, this);
                },

                // Main Methods
                init: function () {
                    this.intercom.comply('add:entry', function() {
                        App.navigate('weekly/sales/new');
                        this.showAddForm();
                    }, this);

                    this.intercom.comply('form:submit', function(data) {
                        this.createEntry(data);
                    }, this);

                    this.intercom.comply('cancel', function() {
                        this.channel.trigger('list:entries');
                    }, this)
                },

                showAddForm: function() {
                    var xhr = Backbone.Radio.request('global', 'operations');
                    $.when(xhr).done(function(opCollection) {
                        var view = new Views.FormView({
                            templateHelpers: {
                                operationList: opCollection.models
                            }
                        });
                        App.Weekly.Layout.contentRegion.show(view);
                    });
                },

                createEntry: function(data) {
                    var intercom = this.intercom,
                        channel = this.channel,
                        model = this.channel.request('entry:new');

                    // save to server
                    if (!model.save(data, {
                            saved: true,
                            success: function (model, res, options) {
                                var msg = 'New entry was successfully created.';
                                intercom.trigger('form:submit:success', msg);
                                channel.command('models:update');
                            },
                            error: function (model, res, options) {
                                var msg = res && res.error && res.error.message && res.error.message.value;
                                intercom.trigger('form:submit:failure', msg);
                            }
                        })) {
                        this.intercom.trigger('form:submit.failure', model.validationError);
                    }
                }
            });
        }
    });

    return App.Weekly.Sales.New;
});