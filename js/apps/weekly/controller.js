define([
    'app',
    'async',
    'apps/weekly/entities/api',
    'apps/weekly/common/views'
], function (App, async, Entities, Views) {
    App.module('Weekly', {
        define: function (Weekly, App, Backbone, Marionette, $, _) {
            Weekly.Controller = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'api': {
                        name: 'weekly:api',
                        events: {
                            on: {
                                'changed:date': 'updateDateRange',
                                'changed:date:mode': 'updateDateRange'
                            }
                        }
                    },
                    'intercom': {
                        name: 'weekly',
                        events: {
                            comply: {
                                'update:region': 'updateRegion',
                                'warn': 'warn'
                            },
                            reply: {
                                'navigate': 'navigate'
                            }
                        }
                    },
                    'main': {
                        name: 'main:api',
                        events: {
                            on: {
                                'changed:operation': 'updateURL'
                            }
                        }
                    }
                },

                // Routes
                prefix: 'weekly',
                routes: {
                    // report
                    '': 'report',
                    ':operation': 'report',

                    // edit
                    'edit': 'edit',
                    'edit/:operation': 'edit'
                },



                //  Initializers
                //  ------------

                init: function(options) {
                    _.each(this.initializers, function(method, name) {
                        method.call(this)
                    }, this);
                },

                // Container for all initializers
                initializers: {
                    // Create the application layout
                    layout: function() {
                        var name = 'layout';
                        this.initView(name,
                            Views.LayoutView,
                            {events: {
                                'edit': 'edit',
                                'report': 'report'
                            }}
                        );
                        App.mainRegion.show(this.views.get(name));
                    },

                    // Initialize the api's
                    api: function() {
                        this.initController('api', Entities.API);
                    },

                    // Create the operation drop down menu
                    opMenu: function() {
                        async.auto({
                            // get operations collection
                            operations: _.bind(function(callback) {
                                var xhr = this.main.request('operations:get'),
                                    onSuccess = function(operations) {callback(null, operations);},
                                    onFailure = function(err) {callback(err);};
                                $.when(xhr).then(onSuccess, onFailure);
                            }, this),

                            // get the user's location
                            userLocation: ['operations', _.bind(function(callback, results) {
                                var xhr = this.main.request('users:current'),
                                    onSuccess = function(location) {callback(null, results.operations, location);},
                                    onFailure = function(err) {callbac(err);};

                                $.when(xhr).then(onSuccess, onFailure)
                            }, this)],

                            // get the appropriate default application if possible
                            defaultOp: ['operations', _.bind(function(callback, results) {
                                var urlOp = this.getURLOperation();

                                if (urlOp) {
                                    callback(null, urlOp);
                                } else if (results.userLocation) {
                                    callback(null, results.userLocation);
                                }
                                else if (results.operations.selected) {
                                    callback(null, results.operations.selected.get('Title'));
                                } else {
                                    callback(null, 'Beulah');
                                }
                            }, this)]

                        }, _.bind(function(err, results) {
                            var layout = this.views.get('layout'),
                                operations = results.operations,
                                defaultOp = results.defaultOp,
                                name = 'opMenu';

                            // select the default operation
                            this.main.request('operations:change', defaultOp);

                            // initialize the op menu view
                            this.initView(name, Views.OpMenuView, null, {collection: operations});
                            layout.opMenuRegion.show(this.views.get(name));
                        }, this));
                    },

                    // Create the date picker menu
                    dateMenu: function() {
                        var date = this.api.request('date:get'),
                            layout = this.views.get('layout'),
                            name = 'dateMenu';
                        this.initView(name,
                            Views.DateMenuView,
                            null,
                            {model: date}
                        );
                        layout.dateMenuRegion.show(this.views.get(name));
                    },

                    // Initialize the modal view
                    modal: function() {
                        var layout = this.views.get('layout'),
                            name = 'modal';
                        this.initView(name, Views.ModalView);
                        layout.modalRegion.show(this.views.get(name));
                    }
                },



                //  Route Handlers
                //  --------------

                // Initialize the 'edit' subapplication
                edit: function(operation) {
                    var path = 'apps/weekly/edit/controller',
                        pathRegExp = /weekly\/edit\/((\/[a-zA-Z]+)|(\/$)?)/;
                    this.api.request('entries:published:only', false);
                    this.initSubApp(path, pathRegExp, 'edit', operation);
                    this.toggleMenu(true);
                },

                // Initialize the 'report' subapplication
                report: function(operation) {
                    var path = 'apps/weekly/report/controller',
                        pathRegExp = /weekly^(\/edit)((\/[a-zA-Z]+)|(\/$)?)/;
                    this.api.request('entries:published:only', true);
                    this.initSubApp(path, pathRegExp, 'report', operation);
                    this.toggleMenu(false);
                },



                //  View Handlers
                //  -------------

                // toggle navigation menu between edit and report
                toggleMenu: function(toEdit) {
                    var to = arguments.length ? toEdit : false;
                    this.views.get('layout').triggerMethod('toggle:menu', to);
                },

                // update the date range in the heading
                updateDateRange: function(date) {
                    var layout = this.views.get('layout'),
                        text = (M.Format(date.get('start'), '//')) + ' through ' + (M.Format(date.get('end'), '//'));
                    layout.triggerMethod('change:date:range', text);
                },

                // update a region's content
                updateRegion: function(name, view) {
                    var layout = this.views.get('layout');
                    if (layout[name]) layout[name].show(view);
                },

                // launch the modal dialogue with a given title, message, and callback
                warn: function(title, msg, callback) {
                    var view = this.views.get('modal'),
                        model = view.model,
                        promise = model.get('promise');

                    model.set({title: title, message: msg});
                    $.when(promise).done(callback);
                    view.triggerMethod('launch');
                },



                //  URL Handlers
                //  ------------

                // get the correct url for applicable state
                getURL: function(arg, operation) {
                    var url = '',
                        selected = this.main.request('operations:current'),
                        urlop = this.getURLOperation();

                    // if no operation is provided, use the currently selected operation if applicable
                    // otherwise use the operation provided in the url, if applicable
                    if (!operation) {
                        operation = urlop || selected;
                    }

                    // if th url has changed, update the selected operation
                    if (urlop && ((selected && selected != urlop) || (!selected))) {
                        this.main.request('operations:change', urlop);
                    }

                    // construct the url
                    switch(arg) {
                        case 'report':
                            url += operation;
                            break;
                        case 'edit':
                            url = 'edit/' + operation;
                            break;
                        case 'new':
                            url = 'edit/new';
                            break;
                    }
                    return url;
                },

                // get the operation from the url if available
                getURLOperation: function() {
                    var currentURL = App.getCurrentRoute(),
                        splitter = /weekly(?:\/edit)?(?:\/)?([a-zA-Z]+)/g,
                        r = splitter.exec(currentURL);
                    return r && r[1];
                },

                // update the operation in the url
                // responds to operation change
                updateURL: function(operation) {
                    var currentURL = App.getCurrentRoute();
                    if (/edit/g.test(currentURL)) {
                        this.navigate('edit/' + operation);
                    }
                    else {
                        this.navigate(operation);
                    }
                },

                // validate url routing
                validateURL: function(regexURL, urlArg, operation) {
                    var url = this.getURL(urlArg, operation);
                    if (!(regexURL.test(App.getCurrentRoute()))) {
                        this.navigate((url));
                    }
                },



                //  Internal Methods
                //  ------------

                // Start a sub app controller
                initSubApp: function(path, pathRegExp, urlArg, operation) {
                    require([path], _.bind(function(C) {
                        this.initController('app', C.Controller, null, {debug: App.debug});
                        this.validateURL(pathRegExp, urlArg, operation);
                    }, this));
                }
            });
        }
    });

    return App.Weekly;
});