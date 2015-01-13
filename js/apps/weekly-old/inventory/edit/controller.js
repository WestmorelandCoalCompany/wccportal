define([
    'app',
    'apps/weekly/inventory/edit/views'
], function (App) {
    App.module('Weekly.Inventory.Edit', {
        define: function (Edit, App, Backbone, Marionette, $, _) {
            Edit.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('weekly.inventory'),
                intercom: Backbone.Radio.channel('weekly.inventory.edit'),

                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn('weekly.inventory.edit');
                    }

                    this.intercom.comply('edit:entry', function(entry) {
                        App.navigate('weekly/inventory/' + (entry.get('Id') || parseInt(entry)) + '/edit');
                        this.editEntry(entry);
                    }, this);

                    this.intercom.comply('cancel', function() {
                        this.channel.trigger('list:entries');
                    }, this);

                    this.intercom.comply('form:submit', function(data) {
                        this.updateEntry(data);
                    }, this);

                    this.intercom.comply('delete:entry', function(entry) {
                        this.deleteEntry(entry);
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.stopComplying(null, null, this);
                },

                // Main Methods
                deleteEntry: function(entry) {
                    if (!(entry instanceof Backbone.Model)) {
                        entry = this.channel.request('entry', entry);
                    }

                    var channel = this.channel,
                        intercom = this.intercom;
                    entry.destroy({
                        wait: true,
                        success: function(model, res, options) {
                            channel.command('models.update');
                            channel.trigger('list:entries');
                        },
                        error: function(model, res, options) {
                            var msg = res && res.error && res.error.message && res.error.message.value;
                            intercom.trigger('form:submit:failure', msg);
                        }
                    });
                },

                editEntry: function(entry) {
                    if (!(entry instanceof Backbone.Model)) {
                        entry = this.channel.request('entry', entry);
                    }
                    var xhr = Backbone.Radio.request('global', 'operations');
                    $.when(xhr).done(function(ops) {
                        var view = new App.Weekly.Inventory.Edit.Views.FormView({
                            model: entry,
                            templateHelpers: {
                                operationList: ops.models
                            }
                        });
                        App.Weekly.Layout.contentRegion.show(view);
                    });
                },

                updateEntry: function(entry) {
                    // get references
                    var data = _.clone(entry.attributes),
                        intercom = this.intercom;

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
                    if (data && data.Tons_Unconvered) {
                        data.Tons_Unconvered = parseFloat(data.Tons_Unconvered);
                    }
                    if (data && data.Tons_Produced) {
                        data.Tons_Produced = parseFloat(data.Tons_Produced);
                    }
                    if (data && data.Beginning_Stockpile_Inventory) {
                        data.Beginning_Stockpile_Inventory = parseFloat(data.Beginning_Stockpile_Inventory);
                    }
                    if (data && data.Ending_Stockpile_Inventory) {
                        data.Ending_Stockpile_Inventory = parseFloat(data.Ending_Stockpile_Inventory);
                    }

                    // Save the model to the server
                    entry.save(data, {
                        saved: true,
                        success: function(model, res, options) {
                            var msg = 'Entry #' + model.get('Id') + ' was succesfully updated.';
                            intercom.trigger('form:submit:success', msg);
                        },
                        error: function(model, res, options) {
                            var msg = res && res.error && res.error.message && res.error.message.value;
                            intercom.trigger('form:submit:failure', msg);
                        }
                    });
                }
            })
        }
    });

    return App.Weekly.Inventory.Edit;
});