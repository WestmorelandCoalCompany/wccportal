define([
    'app',
    'apps/weekly/edit/views',
    'apps/weekly/common/views'
], function (App, Views, CommonViews) {
    App.module('Weekly.Edit', {
        define: function (Edit, App, Backbone, Marionette, $, _) {
            Edit.Controller = M.Controller.extend({
                //  Router
                //  ------
                prefix: 'weekly/edit',
                routes: {
                    '': 'edit'
                },

                //  Channels
                //  --------
                channels: {
                    channel: {},
                    intercom: {name: 'weekly'},
                    api: {name: 'weekly:api'}
                },

                init: function() {
                    // Initialize the layout
                    var layout = new Views.LayoutView();
                    this.views.add({
                        name: 'layout',
                        view: layout,
                        events: {
                            'add': 'addEntry',
                            'back:to:report': 'backToReport'
                        }
                    });
                    App.mainRegion.show(layout);

                    // Initialize the modal
                    var modalView = new CommonViews.ModalView();
                    this.views.add({name: 'modal', view: modalView});
                    layout.modal.show(modalView);

                    // Initialize the date menu
                    var date = this.api.request('date');
                    var dateView = new CommonViews.DateMenuView({model: date});
                    this.views.add({
                        name: 'dateMenu',
                        view: dateView
                    });
                    layout.dateMenu.show(dateView);

                    // Initialize the operation dropdown menu
                    var operations = this.channel.request('operations');
                    var opView = new CommonViews.OperationMenuView({
                        collection: operations
                    });
                    this.views.add({
                        name: 'opMenu',
                        view: opView,
                        events: {
                            'childview:select:operation': 'updateOp'
                        }
                    });
                    layout.opMenu.show(opView);

                    // Select users operation if applicable
                    var location_xhr = this.channel.request('user', {property: 'location'});
                    $.when(location_xhr).done(function(location) {
                        var active = operations.findWhere({Title: location});
                        if (active) {
                            active.select()
                        }
                        else {
                            if (!operations.selected) operations.at(0).select();
                        }
                    });

                    this.edit();
                },

                //  Route Handlers
                //  --------------

                // add new entry
                addEntry: function() {
                    var model = this.api.request('weekly:new'),
                        operations = this.channel.request('operations'),
                        date = this.api.request('date');
                    model.set({'Week_Begin': M.getDayOfWeek(date.get('date'),1,0)});
                    if (operations.selected) model.set({'Operation': operations.selected.get('Title')});
                    this.editEntry({model: model});
                },

                // Show entry list
                edit: function(options) {
                    var layout = this.views.get('layout'),
                        entries = this.api.request('weekly:entry', {ignoreDate: true});

                    var listView = new Views.ListView({
                        collection: entries
                    });
                    this.views.add({
                        name: 'list',
                        view: listView,
                        events: {
                            'childview:edit:entry': 'editEntry',
                            'add': 'addEntry',
                            'back': 'back'
                        }
                    });
                    layout.content.show(listView);
                },

                // edit existing entry
                editEntry: function(args) {
                    var layout = this.views.get('layout'),
                        model = args.model,
                        operations = this.channel.request('operations');

                    var view = new Views.FormView({
                        model: model,
                        operations: operations.toJSON()
                    });
                    this.views.add({
                        name: 'form',
                        view: view,
                        events: {
                            'go:back': 'back',
                            'delete:entry': 'deleteEntry',
                            'save:entry': 'saveEntry'
                        }
                    });

                    layout.content.show(view);
                },

                //  View Handlers
                //  -------------
                back: function(args) {
                    var model = args.model;
                    if (model.hasChanged()) {
                        this.warn('Warning', 'You will lose any unsaved changes.', this.edit);
                    }
                    else {
                        this.edit();
                    }
                },

                backToReport: function(args) {
                    this.intercom.trigger('home');
                },

                deleteEntry: function(args) {
                    var model = args.model;
                    var del = $.proxy(function() {
                        var xhr = this.api.request('delete:entry', model);
                        $.when(xhr).done($.proxy(function() {this.edit()}, this));
                    }, this);
                    this.warn('Warning', 'You are about to delete this entry. Are you sure you want to continue?', del);
                },

                saveEntry: function(args) {
                    var form = this.views.get('form'),
                        model = args.model,
                        data = model._changeSet;
                    var xhr = this.api.request('save:entry', model, data);
                    $.when(xhr).then(
                        function(msg) {Marionette.triggerMethodOn(form, 'show:success', msg)},
                        function(msg) {Marionette.triggerMethodOn(form, 'show:error', msg)}
                    );
                },

                updateOp: function(args) {
                    var layout = this.views.get('layout'),
                        model = args.model;
                    model.select();
                },

                warn: function(title, message, method) {
                    var view = this.views.get('modal'),
                        model = view.model,
                        promise = model.get('promise');

                    model.set({title: title, message: message});
                    $.when(promise).done(method);
                    Marionette.triggerMethodOn(view, 'launch');
                }
            });
        }
    });

    return App.Weekly.Edit;
});