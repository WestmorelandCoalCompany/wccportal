define([
    'app',
    'apps/afe/models',
    'apps/afe/projects/common/views',
    'apps/afe/projects/new/views'
], function (App, Models, CommonViews, Views) {
    App.module('AFE.Projects.New', {
        define: function (New, App, Backbone, Marionette, $, _) {
            New.Controller = M.Controller.extend({
                // Configure Radio
                channels: {
                    channel: {},
                    intercom: {
                        name: 'afe',
                        events: {
                            on: {
                                'show:amounts': 'showAmounts'
                            },
                            reply: {
                                'work:orders': 'getWorkOrders',
                                'amounts': 'getWorkOrderAmounts'
                            }
                        }
                    }
                },

                init: function() {
                    this.initLayout();
                    this.initData();
                    this.showNewForm();
                },

                // Init Methods
                initLayout: function() {
                    var layout = new CommonViews.Layout();
                    this.views.add({
                        name: 'layout',
                        view: layout,
                        events: {
                            'back': $.proxy(function () {
                                this.intercom.command('show:projects');
                            }, this),
                            'save': 'saveProject'
                        }
                    });
                    this.intercom.command('layout:show', layout, 'contentRegion');
                },

                initData: function() {
                    var collections = [];
                    collections.push({name: 'requestedAmounts_get', collection: new Models.CapitalWorkOrderAmounts()},
                        {name: 'requestedAmounts', collection: new Models.Amounts()},
                        {name: 'workOrders', collection: new Models.CapitalWorkOrders()},
                        {name: 'justificationAmounts', collection: new Models.Amounts()});
                    this.collections.add(collections);
                },

                // Show Methods
                showNewForm: function() {
                    // Request operation and ledger options
                    var ops_xhr = this.channel.request('operations'),
                        ledgers_xhr = this.channel.request('ledgers');
                    $.when(ops_xhr, ledgers_xhr).then(
                        $.proxy(function(operations, ledgers) {
                            // Add default options to options
                            if (!operations.findWhere({Title: 'Select an Operation'})) {
                                operations.add({Title: 'Select an Operation'}, {at: 0});
                            }
                            if (!ledgers.findWhere({Ledger: 'Select a Ledger'})) {
                                ledgers.add({Ledger: 'Select a Ledger'}, {at: 0});
                            }

                            // Create an a new project model
                            // Pass the operations and ledgers to the project view
                            var layout = this.views.get('layout');
                                model = new Models.Project(),
                                view = new Views.Project({
                                    model: model,
                                    operations: operations.toJSON(),
                                    ledgers: ledgers.models
                                });

                            // Add the mdoel and view to the controller
                            this.models.add({
                                name: 'currentProject',
                                model: model
                            });

                            this.views.add({
                                name: 'project',
                                view: view,
                                events: {
                                    'show:amounts': 'showAmounts'
                                }
                            });

                            // Show the view
                            this.views.get('layout').projectRegion.show(view);
                        }, this)
                    );
                },

                showAmounts: function(args) {
                    this.showRequestedAmounts(args);
                    this.showJustificationAmounts(args);
                },

                showRequestedAmounts: function(args) {
                    this.resetCollection('requestedAmounts_get', {silent: true});
                    var amount_xhr = this.getWorkOrderAmounts(args);
                    $.when(amount_xhr).then(
                        $.proxy(function(amounts) {
                            // Create missing models
                            this.createPlaceholderHashes('requested', amounts);

                            // Create the view
                            var view = new Views.RequestedAmounts({
                                collection: amounts
                            });
                            this.views.add({
                                name: 'requestedAmounts',
                                view: view
                            });

                            this.views.get('layout').requestedRegion.show(view);
                        }, this)
                    );
                },

                showJustificationAmounts: function(args) {
                    // Create models
                    args = $.extend({reset: true}, args);
                    var amounts = this.collections.get('justificationAmounts');
                    if (args.reset) amounts.reset();
                    this.createPlaceholderHashes('justification', amounts);

                    // Create the view
                    var view = new Views.JustificationAmounts({
                        collection: amounts
                    });
                    this.views.add({
                        name: 'justificationAmounts',
                        view: view,
                        events: {
                            'add:row': 'addNewRow',
                            'delete:row': 'deleteRow',
                            'change:desc': 'changeDesc'
                        }
                    });

                    this.views.get('layout').justificationRegion.show(view);
                },

                //  Data Manipulation
                //  -----------------

                // Add new amounts row
                addNewRow: function(args) {
                    var amounts = this.collections.get('justificationAmounts');
                    this.createPlaceholderHashes('justification', amounts);
                },

                // Change row description
                changeDesc: function(from, to) {
                    var amounts = this.collections.get('justificationAmounts');
                    amounts.each(function(model) {
                        if (model.get('Title') == from) {
                            model.set({Title: to});
                        }
                    });
                    amounts.trigger('reset');
                },

                // Create the required collection structure for an amounts view
                createPlaceholderHashes: function(name, collection) {
                    var year = this.year ? this.year : new Date().getFullYear(),
                        dates = [];
                    switch(name) {
                        case 'requested':
                            // get ledgers
                            var ledgers = _.uniq(collection.pluck('Ledger'));
                            _.each(['Budget', 'Requested'], function(type) {
                                if (ledgers.indexOf(type) == -1) ledgers.push(type);
                            });

                            // get dates
                            _.each(_.range(1,13), function(m) {
                                dates.push(new Date(year, m, 0, 0, 0, 0));
                            });

                            // loop through collection and create missing
                            _.each(ledgers, function(ledger) {
                                _.each(dates, function(date) {
                                    var type = ledger == 'Requested' ? 'Requested' : 'Variance';
                                    var attrs = {
                                        Ledger: ledger,
                                        Date: date,
                                        Amount_Type: type
                                    };
                                    this.findOrCreate(collection, attrs);
                                }, this);
                            }, this);
                            break;
                        case 'justification':
                            // get dates
                            var desc = 'Description ' + (parseInt(collection.length / 10) + 1);
                            _.each(_.range(1,11), function(y) {
                                var d = new Date((year + y + 1), 0, 0);
                                var attrs = {
                                    Ledger: null,
                                    Date: d,
                                    Amount_Type: 'Justification',
                                    Title: desc
                                };
                                collection.add(attrs, {silent: true});
                            });
                            collection.trigger('add');
                            break;
                    }
                },

                // Delete amounts row
                deleteRow: function(title) {
                    var promise = this.intercom.request('modal:promise');
                    var deleteModels = $.proxy(function() {
                        var amounts = this.collections.get('justificationAmounts'),
                            toRemove = [];
                        amounts.each(function(model) {
                            if (model.get('Title') == title) {
                                if (!model.isNew()) model.destroy({wait: true});
                                toRemove.push(model)
                            }
                        });
                        amounts.remove(toRemove);
                    }, this);

                    $.when(promise).done(deleteModels);
                    this.intercom.command('show:modal', 'Warning', 'Are you sure you want to delete ' + title + '?');
                },

                // Search for a model with a given date and ledger
                // If no model is found, create it
                findOrCreate: function(collection, attrs) {
                    var x = collection.find(function(model) {
                        var d = model.get('Date'),
                            sameDay = (d.getDate() == attrs.Date.getDate()) &&
                                (d.getMonth() == attrs.Date.getMonth()) &&
                                (d.getFullYear() == attrs.Date.getFullYear()),
                            sameLedger = model.get('Ledger') == attrs.Ledger;
                        return sameDay && sameLedger;
                    });
                    if (!x) {
                        collection.add(attrs);
                    }
                },

                // Save project
                saveProject: function() {
                    var layout = this.views.get('layout'),
                        projectView = this.views.get('project'),
                        data = Marionette.triggerMethodOn(projectView, 'save'),
                        model = projectView.model,
                        isNew = model.isNew();

                    var saved = model.save(data, {
                        saved: true,
                        etag: '*',
                        success: $.proxy(function(model, res, options) {
                            var msg;
                            if (isNew) {
                                msg = 'New AFE was successfully created.';
                            }
                            else {
                                msg = 'AFE (' + model.get('Work_x0020_Order_x0020_Number') +
                                    ': ' + model.get('Work_x0020_Order_x0020_Desc') + ') was ' +
                                    'successfully updated.';
                            }
                            this.saveAmounts(msg, model.id);
                        }, this),
                        error: function(model, res, options) {
                            var msg = res && res.error && res.error.message && res.error.message.value;
                            layout.triggerMethod('show:error', msg);
                        }
                    });

                    if (!saved) {
                        layout.triggerMethod('show:error', model.validationError);
                    }
                },

                saveAmounts: function(msg, id) {
                    var layout = this.views.get('layout'),
                        requested = this.collections.get('requestedAmounts'),
                        justifications = this.collections.get('justificationAmounts'),
                        errors = [],
                        toAdd = [];

                    // Save or Destroy amount models
                    _.each([requested, justifications], function(collection) {
                        collection.each(function(model) {
                            // Add the project ID
                            model.set('Capital_x0020_ProjectId', id);

                            // Get reference to attributes and amount specifically
                            var attrs = model.attributes,
                                amount = model.has('Amount') ? model.get('Amount') : 0;

                            // If it has an amount, save it
                            if (amount && amount != 0) {
                                if (!model.save(attrs, {
                                        saved: true,
                                        etag: '*',
                                        error: function(model, res) {
                                            errors.push(model.id + ': ' + res.error.message.value);
                                        }
                                    })) {
                                    errors.push(model.id + ': ' + model.validationError);
                                }
                            }
                            else {
                                // Else, if updating, delete it
                                if (!model.isNew()) {
                                    if (!model.destroy({
                                            deleted: true,
                                            wait: true,
                                            success: function(model, res, options) {
                                                if (attrs.Amount) delete attrs.Amount;
                                                toAdd.push(new collection.model(attrs));
                                            },
                                            error: function(model, res) {
                                                errors.push(model.id + ': ' + res.error.message.value);
                                            }
                                        })) {
                                        errors.push(model.id + ': ' + res.error.message.value);
                                    }
                                }
                            }

                            // Add replacement models with no amount
                            if (toAdd.length) {
                                collection.add(toAdd);
                            }
                        });
                    });

                    // Show response
                    if (errors.length) {
                        msg += errors.join('\n');
                        layout.triggerMethod('show:error', msg);
                    }
                    else {
                        layout.triggerMethod('show:success', msg);
                    }
                },

                //  Data API
                //  --------

                // Reset a collection with a given name
                resetCollection: function(name, options) {
                    this.collections.get(name).reset(null, options);
                },

                // Return Work Order collection with given arguments
                getWorkOrders: function(args) {
                    return this.getCollection('workOrders', args);
                },

                // Return Amounts with given arguments
                getWorkOrderAmounts: function(args) {
                    args || (args = {});
                    $.extend(args, {remove: false});

                    var defer = $.Deferred(),
                        amounts = this.collections.get('requestedAmounts'),
                        xhr1 = this.getCollection('requestedAmounts_get', args),
                        xhr2;

                    if (args.data.ledger != 'Budget') {
                        var args2 = _.clone(args);
                        args2.data.ledger = 'Budget';
                        xhr2 = this.getCollection('requestedAmounts_get', args2);
                    }
                    else {
                        xhr2 = xhr1;
                    }

                    $.when(xhr1, xhr2).then(
                        $.proxy(function(return_amounts) {
                            amounts.reset(return_amounts.toJSON());
                            defer.resolve(amounts);
                        }, this),
                        function(a, b) {
                            console.log(a, b);
                        }
                    );
                    return defer.promise();
                }
            });
        }
    });

    return App.AFE.Projects.New;
});