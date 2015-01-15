define([
    'app',
    'apps/afe/models',
    'apps/utils/fpa/irr'
], function (App, Models, IRR) {
    App.module('AFE.Projects.New.Models.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                //  Configuration
                //  -------------
                events: {
                    reply: {
                        'justification': 'justification',
                        'new:project': 'project',
                        'projects': 'projects',
                        'requested': 'requested',
                        'save:amounts': 'saveAmounts',
                        'save:project': 'saveProject',
                        'summary': 'summary'
                    },
                    comply: {
                        'add:row': 'addJustificationRow',
                        'delete:row': 'deleteJustificationRow',
                        'change:desc': 'changeDesc'
                    }
                },

                channels: {
                    channel: {
                        name: 'afe:api',
                        events: {
                            reply: {
                                'work:orders': 'workOrders'
                            }
                        }
                    }
                },

                //  Models & Collections
                //  --------------------

                // Justification Amounts
                justification: function(options) {
                    options || (options = {});
                    var collection = this.collections.get('justification');
                    if (!collection || (!(collection instanceof Models.Amounts))) {
                        collection = new Models.Amounts();
                        this.collections.add({name: 'justification', collection: collection});
                    }
                    if (options.reset || collection.length == 0) {
                        collection.reset();
                        this.createPlaceholderModels('justification', collection, options);
                    }
                    return collection;
                },

                // Empty Project
                project: function(options) {
                    options || (options = {});
                    var project = this.models.get('project');
                    if (!project || (!(project instanceof Models.Project))) {
                        project = new Models.Project();
                        this.models.add({name: 'project', model: project});
                    }
                    return project;
                },

                // Project List matching Operation, Ledger, Year
                projects: function(options) {
                    return this._initCollection('projects', Models.Projects, options);
                },

                // Requested Amounts matching Operation, Ledger, Year, Work Order Number
                requested: function(options) {
                    options || (options = {});
                    var get_collection = this.collections.get('requested_from_server'),
                        return_collection = this.collections.get('requested');
                    if (!get_collection) {
                        get_collection = new Models.CapitalWorkOrderAmounts();
                        this.collections.add({
                            name: 'requested_from_server',
                            collection: get_collection
                        });
                    }
                    if (!return_collection) {
                        return_collection = new Models.Amounts();
                        this.collections.add({name: 'requested', collection: return_collection});
                    }
                    return this.getProjectAmounts(options);
                },

                // summary
                summary: function(options) {
                    options || (options = {});
                    var summary = this.models.get('summary')
                    if (!summary) {
                        summary = new Backbone.Model();
                        this.models.add({name: 'summary', model: summary});
                    }
                    return this.updateSummary(options);
                },

                workOrders: function(options) {
                    return this._initCollection('workOrders', Models.CapitalWorkOrders, options);
                },

                _initCollection: function(name, collection, options) {
                    options || (options = {});
                    var c = this.collections.get(name);
                    if (!c) {
                        c = new collection();
                        this.collections.add({name: name, collection: c});
                    }
                    return this.getCollection(name, options);
                },

                //  Data Operations
                //  ---------------

                // Add 10 empty models with new description
                addJustificationRow: function(options) {
                    var collection = this.collections.get('justification');
                    this.createPlaceholderModels('justification', collection, options);
                },

                changeDesc: function(from, to) {
                    var amounts = this.collections.get('justification');
                    amounts.each(function(model) {
                        if (model.get('Title') == from) {
                            model.set({Title: to});
                        }
                    });
                    amounts.trigger('reset');
                },

                // Create the required collection structure for an amounts views
                createPlaceholderModels: function(name, collection, options) {
                    var year = options.year ? options.year : new Date().getFullYear(),
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
                            _.each(_.range(0,10), function(y) {
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

                deleteJustificationRow: function(title) {
                    var amounts = this.collections.get('justification'),
                        toRemove = [];

                    amounts.each(function(model) {
                        if (model.get('Title') == title) {
                            if (!model.isNew()) model.destroy({wait: true, deleted: true});
                            toRemove.push(model);
                        }
                    });
                    amounts.remove(toRemove);
                },

                // Search for a model with a given date and ledger
                // If no model is found, create it and add it to the collection
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

                // Return project amounts from data service with given Operation, Ledger, Year, and WO Number
                getProjectAmounts: function(options) {
                    options || (options = {});
                    _.extend(options, {remove: false});

                    var defer = $.Deferred(),
                        amounts = this.collections.get('requested'),
                        return_amounts = this.collections.get('requested_from_server');

                    // Reset the collection and make the initial call
                    return_amounts.reset();
                    var xhr1 = this.getCollection('requested_from_server', options),
                        calls = [xhr1];

                    // Add a second call for budget amounts, if selected ledger is not budget
                    if (options.data.ledger != 'Budget') {
                        var options2 = _.clone(options);
                        options.data.ledger = 'Budget';
                        var xhr2 = this.getCollection('requested_from_server', options2);
                        calls.push(xhr2);
                    }

                    $.when.apply($, calls).then(
                        $.proxy(function() {
                            amounts.reset(return_amounts.toJSON());
                            this.createPlaceholderModels('requested', amounts, options);
                            defer.resolve(amounts);
                        }, this),
                        function() {
                            console.log('There was an error retreiving the requested Work Order Amounts from the server.')
                        }
                    );
                    return defer.promise();
                },

                saveAmounts: function(id) {
                    var requested = this.collections.get('requested'),
                        justifications = this.collections.get('justification'),
                        calls = [], errors = [], toAdd = [], defer = $.Deferred(),
                        msg = '';

                    _.each([requested, justifications], function(collection) {
                        collection.each(function(model) {
                            // Add the project ID
                            model.set('Capital_x0020_ProjectId', id);

                            // Get references to attributes and amount specifically
                            var attrs = model.attributes,
                                amount = model.has('Amount') ? model.get('Amount') : 0;

                            // If it has an amount, save it,
                            // Otherwise, if it had an amount and is now zero, destroy it
                            if (amount && amount != 0) {
                                var saved = model.save(attrs, {
                                    saved: true,
                                    etag: '*',
                                    error: function(model, res) {
                                        errors.push(model.id + ': ' + res.error.message.value);
                                    }
                                });
                                calls.push(saved)
                            }
                            else {
                                if (!model.isNew()) {
                                    var deleted = model.destroy({
                                        deleted: true,
                                        wait: true,
                                        success: function(model, res, options) {
                                            if (attrs.Amount) delete attrs.Amount;
                                            toAdd.push(new collection.model(attrs));
                                        },
                                        error: function(model, res) {
                                            errors.push(model.id + ': ' + res.error.message.value);
                                        }
                                    });
                                    calls.push(deleted)
                                }
                            }

                            // Add replacement models with no amount
                            if (toAdd.length) {
                                collection.add(toAdd);
                            }
                        });
                    });

                    if (errors.length) {
                        msg += errors.join('\n');
                        defer.reject(msg);
                    }
                    else {
                        defer.resolve();
                    }

                    return defer.promise();
                },

                saveProject: function(data, options) {
                    options || (options = {});
                    var model = this.models.get('project'),
                        defer = $.Deferred(),
                        isNew = model.isNew(),
                        msg;

                    $.extend(options, {
                        saved: true,
                        etag: '*',
                        success: function(model, res, options) {
                            if (isNew) {
                                msg = 'New AFE was successfully created.';
                            }
                            else {
                                msg = 'AFE (' + model.get('Work_x0020_Order_x0020_Number') +
                                ': ' + model.get('Work_x0020_Order_x0020_Desc') + ') was ' +
                                'successfully updated.';
                            }
                            defer.resolve(msg, model.id);
                        },
                        error: function(model, res, options) {
                            var msg = res.error.message.value;
                            defer.reject(msg);
                        }
                    });

                    var saved = model.save(data, options);
                    if (!saved) {
                        defer.reject(model.validationError);
                    }

                    return defer.promise();
                },

                updateSummary: function(options) {
                    options || (options = {});
                    var summary = this.models.get('summary'),
                        rate = options.rate || .08,
                        y = options.year || new Date().getFullYear();

                    // Grab the collections
                    var requested = this.collections.get('requested'),
                        justification = this.collections.get('justification');

                    // Get the totals
                    var requested_total = requested.getTotalByWhere({Ledger: 'Requested'}) * -1.0,
                        justification_totals = {};
                    _.each(_.range(1,11), function(diff) {
                        justification_totals[(y+diff)] = 0;
                    });
                    var years = _.uniq(justification.map(function(model) {
                        return model.get('Date').getFullYear();
                    }));
                    _.each(years, function(year) {
                        justification_totals[year] = justification.getTotalByYear(year);
                    });

                    // Calculate Metrics
                    //New stuff                    
                    //End new stuff

                    var npv = requested_total;
                    var pbp = 0, investment = -requested_total;
                    var vals = _.values(justification_totals);
                    vals.unshift(requested_total);
                    var irr = IRR(vals, rate);
                    _.each(justification_totals, function(val, year) {
                        year = parseInt(year);
                        npv += (val/Math.pow(1+rate,year-y));  
                        if (investment != 0)
                            if (val <= investment) {
                                investment -= val;
                                pbp++;
                            } else {
                                pbp += (investment / val);
                                investment = 0;
                            }
                    });
                    if (npv == 0) npv = '';

                    summary.set({
                        npv: npv,
                        pbp: (investment == 0) ? pbp : "Not Paid Back",
                        irr: irr,
                        year: y,
                        rate: rate
                    });
                    return summary;
                }
            });
        }
    });

    return App.AFE.Projects.New.Models.API;
});