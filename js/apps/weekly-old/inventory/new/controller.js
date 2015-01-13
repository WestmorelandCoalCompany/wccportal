define([
    'app',
    'apps/weekly/inventory/models',
    'apps/weekly/inventory/new/views'
], function (App, Models, Views) {
    App.module('Weekly.Inventory.New', {
        define: function (New, App, Backbone, Marionette, $, _) {
            New.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('weekly.inventory'),
                intercom: Backbone.Radio.channel('weekly.inventory.new'),

                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly.inventory.new');
                    }

                    this.intercom.comply('add:entry', function() {
                        App.navigate('weekly/inventory/new');
                        this.addEntry();
                    }, this);

                    this.intercom.comply('form:submit', function(entry) {
                        this.createEntry(entry);
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.stopComplying(null, null, this);
                },

                // Methods
                addEntry: function() {
                    var xhr = Backbone.Radio.request('global', 'operations');
                    $.when(xhr).done(function(ops) {
                        var view = new Views.FormView({
                            templateHelpers: {
                                operationList: ops.models
                            }
                        });
                        App.Weekly.Layout.contentRegion.show(view);
                    });
                },

                createEntry: function(entry) {
                    var data = _.clone(entry),
                        intercom = this.intercom,
                        channel = this.channel,
                        model = this.channel.request('entry:new');

                    // parse attributes for dates and numbers
                    if (data && data.Week_Begin) {
                        data.Week_Begin = new Date(data.Week_Begin);
                    }
                    if (data && data.Week_End) {
                        data.Week_End = new Date(data.Week_End);
                    }
                    if (data && data.Beginning_Pit_Inventory) {
                        data.Beginning_Pit_Inventory = parseFloat(data.Beginning_Pit_Inventory);
                    }
                    else {
                        data.Beginning_Pit_Inventory = 0
                    }
                    if (data && data.Tons_Unconvered) {
                        data.Tons_Unconvered = parseFloat(data.Tons_Unconvered);
                    }
                    else {
                        data.Tons_Unconvered = 0
                    }
                    if (data && data.Tons_Produced) {
                        data.Tons_Produced = parseFloat(data.Tons_Produced);
                    }
                    else {
                        data.Tons_Produced = 0
                    }
                    if (data && data.Beginning_Stockpile_Inventory) {
                        data.Beginning_Stockpile_Inventory = parseFloat(data.Beginning_Stockpile_Inventory);
                    }
                    else {
                        data.Beginning_Stockpile_Inventory = 0
                    }
                    if (data && data.Ending_Stockpile_Inventory) {
                        data.Ending_Stockpile_Inventory = parseFloat(data.Ending_Stockpile_Inventory);
                    }
                    else {
                        data.Ending_Stockpile_Inventory = 0
                    }

                    // Save the model to the server
                    if (!model.save(data, {
                        saved: true,
                        success: function(model, res, options) {
                            var msg = 'New entry was successfully created.';
                            intercom.trigger('form:submit:success', msg);
                            channel.command('models:update');
                        },
                        error: function(model, res, options) {
                            var msg = res && res.error && res.error.message && res.error.message.value;
                            intercom.trigger('form:submit:failure', msg);
                        }
                    })) {
                        intercom.trigger('form:submit:failure', model.validationError);
                    }
                }
            });
        }
    });

    return App.Weekly.Inventory.New;
});