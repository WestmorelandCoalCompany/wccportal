define([
    'app',
    'apps/weekly/sales/edit/views',
    'apps/weekly/sales/models'
], function (App, Views) {
    App.module('Weekly.Sales.Edit', {
        define: function (Edit, App, Backbone, Marionette, $, _) {
            Edit.Controller = Marionette.Controller.extend({
                // Configuration
                channel: Backbone.Radio.channel('weekly.sales'),
                intercom: Backbone.Radio.channel('weekly.sales.edit'),

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
                    console.log('Edit.Controller initializing')
                    this.intercom.comply('edit:entry', function(entry) {
                        App.navigate('weekly/sales/' + (entry.get('Id') || parseInt(entry)) + '/edit');
                        this.showEditForm(entry);
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

                showEditForm: function(entry) {
                    if (!(entry instanceof Backbone.Model)) {
                        entry = this.channel.request('entry', entry);
                    }
                    var xhr = Backbone.Radio.request('global', 'operations');
                    $.when(xhr).done(function(opCollection) {
                        var view = new Views.FormView({
                            model: entry,
                            templateHelpers: {
                                operationList: opCollection.models
                            }
                        });
                        App.Weekly.Layout.contentRegion.show(view);
                    });
                },

                updateEntry: function(entry) {
                    var data = _.clone(entry.attributes),
                        intercom = this.intercom,
                        validationErrors = [];

                    // delete aggregated data
                    _.each(['MTD_Actual_Tons', 'MTD_Forecast_Tons', 'MTD_Budget_Tons',
                        'YTD_Actual_Tons', 'YTD_Forecast_Tons', 'YTD_Budget_Tons'], function(attribute) {
                        if (data[attribute]) {
                            delete data[attribute];
                        }
                        if (entry.get(attribute)) {
                            entry.unset(attribute);
                        }
                    });

                    // format required data
                    _.each([
                        ['Actual_Tons', 'number'],
                        ['Forecast_Tons', 'number'],
                        ['Budget_Tons', 'number'],
                        ['Week_Begin', 'date'],
                        ['Week_End', 'date'],
                    ], function (pair) {
                        if (data[pair[0]]) {
                            var val = validator(data[pair[0]], pair[1]);
                            if (!val) {
                                validationErrors.push((pair[0] + ' is not a valid ' + pair[1] + '.'));
                            }
                            else {
                                data[pair[0]] = val;
                            }
                        }
                    });

                    if (validationErrors.length > 0) {
                        var msg = validationErrors.join(' ');
                        this.intercom.trigger('form:submit:failure', msg);
                    }
                    else {
                        if (!entry.save(data, {
                                saved: true,
                                success: function(model, res, options) {
                                    var msg = 'Entry #' + model.get('Id') + ' was succesfully updated.';
                                    intercom.trigger('form:submit:success', msg);
                                },
                                error: function(model, res, options) {
                                    var msg = res && res.error && res.error.message && res.error.message.value;
                                    intercom.trigger('form:submit:failure', msg);
                                }
                            })) {
                            this.intercom.trigger('form:submit:failure', entry.validationError);
                        }
                    }
                }
            });

            var validator = function(val, type) {
                switch (type) {
                    case 'date':
                        if ($.type(val) === 'date') {
                            return new Date(val);
                        }
                        else {
                            val = new Date(Date.parse(val));
                            if ($.type(val) === 'date') {
                                return val;
                            }
                            return false;
                        }
                    case 'number':
                        if ($.type(val) === 'number') {
                            return val
                        }
                        else {
                            val = parseFloat(val.replace(/[^0-9.\-]/g, ''));
                            if (isNaN(val)) {
                                return false;
                            }
                            return val;
                        }
                }
            };
        }
    });

    return App.Weekly.Sales.Edit;
});