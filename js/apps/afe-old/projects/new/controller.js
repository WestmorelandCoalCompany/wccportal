define([
    'app',
    'apps/afe/projects/new/api',
    'apps/afe/projects/common/views',
    'apps/afe/projects/new/views'
], function (App, Models, CommonViews, Views) {
    App.module('AFE.Projects.New', {
        define: function (New, App, Backbone, Marionette, $, _) {
            New.Controller = M.Controller.extend({
                // Configure Radio
                channels: {
                    'intercom': {
                        name: 'afe'
                    },
                    'main': {
                        name: 'main:api'
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
                            'save': 'saveProject',
                            'submit': 'submitProject'
                        }
                    });
                    this.intercom.command('layout:show', layout, 'contentRegion');
                },

                initData: function() {
                    var api = this.controllers.get('api');
                    if (!api || (!(api instanceof Models.API))) {
                        api = new Models.API();
                        this.controllers.add({name: 'api', controller: api});
                    }
                },

                // Show Methods
                showNewForm: function() {
                    // Request operation and ledger options
                    var api = this.controllers.get('api'),
                        ops_xhr = this.main.request('operations:get'),
                        ledgers_xhr = this.main.request('ledgers:get');

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
                            var layout = this.views.get('layout'),
                                model = api.request('new:project'),
                                view = new Views.Project({
                                    model: model,
                                    operations: operations.toJSON(),
                                    ledgers: ledgers.models
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
                    this.showSummary(args);
                },

                showJustificationAmounts: function(args) {
                    // Create models
                    args = $.extend({reset: true}, args);

                    var api = this.controllers.get('api'),
                        amounts = api.request('justification', args);

                    // Create the view
                    var view = new Views.JustificationAmounts({
                        collection: amounts,
                        year: args.year
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

                showRequestedAmounts: function(args) {
                    var api = this.controllers.get('api'),
                        amount_xhr = api.request('requested', args);
                    $.when(amount_xhr).then(
                        $.proxy(function(amounts) {
                            // Create the view
                            var view = new Views.RequestedAmounts({
                                collection: amounts,
                                year: args.year
                            });
                            this.views.add({
                                name: 'requestedAmounts',
                                view: view
                            });

                            this.views.get('layout').requestedRegion.show(view);
                        }, this)
                    );
                },

                showSummary: function(args) {
                    var api = this.controllers.get('api'),
                        summary_xhr = api.request('summary', args);

                    $.when(summary_xhr).then(
                        $.proxy(function(summary) {
                            var view = this.views.get('summary');
                            if (!view) {
                                var view = new CommonViews.Summary({model: summary}),
                                    layout = this.views.get('layout');
                                this.views.add({
                                    name: 'summary',
                                    view: view,
                                    events: {
                                        'recalculate': 'updateSummary'
                                    }
                                });
                                layout.summaryRegion.show(view);
                            }
                        }, this),
                        function() {

                        }
                    );
                },

                //  Data Manipulation
                //  -----------------

                // Add new amounts row
                addNewRow: function(args) {
                    args || (args = {});
                    var form = this.views.get('project'),
                        year = form.triggerMethod('get:year');
                    _.extend(args, {year: year});
                    var api = this.controllers.get('api');
                    api.command('add:row', args);
                },

                // Change row description
                changeDesc: function(from, to) {
                    var api = this.controllers.get('api');
                    api.command('change:desc', from, to);
                },

                // Delete amounts row
                deleteRow: function(title) {
                    var promise = this.intercom.request('modal:promise'),
                        api = this.controllers.get('api');

                    $.when(promise).done(function() {
                        api.command('delete:row', title);
                    });

                    this.intercom.command('show:modal', 'Warning', 'Are you sure you want to delete ' + title + '?');
                },

                // Save project
                saveProject: function() {
                    var api = this.controllers.get('api'),
                        layout = this.views.get('layout'),
                        projectView = this.views.get('project'),
                        //data = Marionette.triggerMethodOn(projectView, 'save'),
                        model = projectView.model,
                        data = model._changeSet;

                    var saved = api.request('save:project', data);
                    if (!saved) layout.triggerMethod('show:error', model.validationError);
                    $.when(saved).then(
                        $.proxy(function(msg, id) {
                            layout.triggerMethod('show:success', msg);
                            this.saveAmounts(msg, id);
                        }, this),
                        function(err) {
                            layout.triggerMethod('show:error', err);
                        }
                    );
                },

                // Save project amounts
                saveAmounts: function(msg, id) {
                    var api = this.controllers.get('api'),
                        layout = this.views.get('layout');

                    var saved = api.request('save:amounts', id);
                    if (!saved) layout.triggerMethod('show:error', 'An error occurred while attempting to save the project amounts');
                    $.when(saved).then(
                        function() {
                            layout.triggerMethod('show:success', msg);
                        },
                        function(err) {
                            layout.triggerMethod('show:error', err);
                        }
                    );
                },

                // Change submitted to true and save
                submitProject: function() {
                    var api = this.controllers.get('api'),
                        promise = this.intercom.request('modal:promise'),
                        project = api.request('new:project');

                    $.when(promise).done($.proxy(function() {
                        project.set({Submitted: true});
                        this.saveProject();
                    }, this));

                    this.intercom.command('show:modal', 'Confirmation', 'Are you sure you want to submit for approval?');
                },

                // Update summary calculations
                updateSummary: function() {
                    var api = this.controllers.get('api'),
                        form = this.views.get('project'),
                        year = form.triggerMethod('get:year');
                    api.request('summary', {year: year});
                }
            });
        }
    });

    return App.AFE.Projects.New;
});