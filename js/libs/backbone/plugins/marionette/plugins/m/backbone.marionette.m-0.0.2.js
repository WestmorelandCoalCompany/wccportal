(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'jquery', 'marionette', 'underscore', 'backbone.radio.shim', 'marionette.subrouter'], function(Backbone, $, Marionette, _) {
            return (root.M = factory(root, Backbone, $, Marionette, _));
        });
    } else if (typeof exports !== 'undefined') {
        var Backbone = require('backbone');
        var $ = require('jquery');
        var Marionette = require('marionette');
        var _ = require('underscore');
        module.exports = factory(root, Backbone, $, Marionette, _);
    } else {
        root.M = factory(root, root.Backbone, root.$, root.Marionette, root._);
    }
}(this, function(root, Backbone, $, Marionette, _) {
    "use strict";

    // Initial Setup
    // --------------
    //region Configuration
    var previousM = root.M;

    var _Controller = Marionette.Controller,
        _Controller_proto = Marionette.Controller.prototype,
        Events = Backbone.Events,
        Requests = Backbone.Radio.Requests,
        Commands = Backbone.Radio.Commands;

    var M = Marionette.M = {
        VERSION: "0.0.2"
    };
    //endregion

    M.noConflict = function() {
        root.M = previousM;
        return this
    };

    Marionette.M = M;

    //  M.Container
    //  -----------
    //region M.Container
    var Container = M.Container = function(contents, options) {
        options || (options = {});
        this.controller = (options.controller || null);
        if (options.type) this.type = options.type;
        this._reset();
        this.initialize.apply(this, arguments);
        if (contents) this.reset(contents, _.extend({silent: true}, options));
    };

    var addOptions = {
        destroy: true
    };

    _.extend(Container.prototype, Events, Requests, Commands, {
        // Provide an empty initialize function
        initialize: function() {},

        // Add contents
        add: function(objs, options) {
            options || (options = {});
            options = _.defaults(options, addOptions);
            return this.set(objs, options);
        },

        // Remove object from container
        remove: function(name, options) {
            this._remove(name, options);
        },

        // Add contents to the container
        set: function(contents, options) {
            options || (options = {});
            contents = (!_.isArray(contents)) ? (contents ? [contents] : []) : contents.slice();

            _.each(contents, function(hash) {
                if (!hash.name) throw new Error('Name required in order to add to container.');
                var obj = hash[this.type],
                    cobj;
                if (!obj) throw new Error('Object is required in order to add to container');
                switch(this.type) {
                    case 'controller':
                        cobj = Marionette.Controller;
                        break;
                    case 'view':
                        cobj = Backbone.View;
                        break;
                    case 'model':
                        cobj = Backbone.Model;
                        break;
                    case 'collection':
                        cobj = Backbone.Collection;
                        break;
                }
                if (!(obj instanceof cobj)) {
                    throw new Error('Object is not the correct type');
                }
                if (this.contents[hash.name] && (this.contents[hash.name] != obj)) {
                    this.remove(hash.name, options);
                }
                this.contents[hash.name] = obj;

                // Bind events
                if (hash.events) {
                    var self = this.controller || this;
                    obj.options || (obj.options = {});
                    obj.options.events = hash.events;
                    Marionette.bindEntityEvents(self, obj, hash.events);
                }
            }, this);
        },

        bindEntityEvents: Marionette.bindEntityEvents,

        destroy: function(options) {
            options || (options = {});
            _.extend(options, {destroy: true});

            switch (this.type) {
                case 'controller':
                    _.each(_.keys(this.contents), function(name) {
                        this.remove(name, options);
                    }, this);
                    break;
                case 'model':
                case 'view':
                case 'collection':
                    _.each(this.contents, function(obj, key) {
                        this.remove(key, options);
                    }, this);

            }
        },

        // Get contents from the container by id
        get: function(name) {
            if (name == null) return void 0;
            return this.contents[name];
        },

        _reset: function() {
            this.length = 0;
            this.contents = {};
        },

        _remove: function(name, options) {
            options || (options = {});
            var obj = this.contents[name];
            if (this.type == 'controller') {
                var bindings = obj.getOption('events');
                var self = this.controller || this;
                if (bindings) {
                    _.each(_.values(bindings), function(hash) {
                        Marionette.unbindEntityEvents(self, obj, hash);
                    })
                }
            }

            if (obj) {
                if (options.destroy) {
                    switch(this.type) {
                        case 'controller':
                            obj.destroy();
                        case 'view':
                            obj.destroy();
                    }
                }
            }
            delete this.contents[name];
        }
    });
    //endregion

    //  M.Controller
    //  ------------
    //region M.Controller
    var Controller = M.Controller = Marionette.Controller.extend({
        initialize: function(options) {
            _.bindAll.apply (_, [this].concat (_.functions (this)));

            options || (options = {});
            this.cid = _.uniqueId ('c');

            // Configure Containers
            this.controllers = {};
            this.collections = {};
            this.models = {};
            this.views = {};
            this.routers = {};
            _.each (['controllers', 'models', 'collections', 'views', 'routers'], function(container) {
                var type = container.substr (0, container.length - 1),
                    options = {
                        type: type,
                        controller: this
                    };
                var c = new Container (null, options);
                this[container] = c;
            }, this);

            // Configure Events
            this._configureEvents(options);
            this._configureChannels (options);

            // Handle destroy
            this.on ('destroy', function() {
                // destroy container contents
                _.each (['views', 'models', 'collections', 'controllers'], function(container) {
                    this[container].destroy ();
                }, this);

                // unbind events
                this._destroyEvents(options);
                this._destroyChannels (options);
            }, this);

            // Call init function if available
            if (_.isFunction (this.init)) {
                this.init (options);
            }

            // Configure SubRouter
            this._configureSubRouter(options);
        }
    });

    _.extend(Controller.prototype, Events, Requests, Commands, {
        getCollection: function(name, options) {
            options || (options = {});

            var collection = this.collections.get(name),
                defer = $.Deferred();

            _.extend(options, {
                deferred: defer,
                success: function() {
                    defer.resolve(collection);
                },
                error: function() {
                    defer.fail();
                }
            });

            if (!collection || (!(collection instanceof Backbone.Collection))) return void 0;
            if (collection.length == 0 || options.update) {
                collection.fetch(options);
            }
            else {
                defer.resolve(collection);
            }
            return defer.promise();
        },

        _configureSubRouter: function(options) {
            if (!this.routes || (!_.isObject(this.routes))) return void 0;
            this.prefix = this.prefix || (options.prefix ? options.prefix : '');
            var subrouter = Marionette.SubRouter.extend({
                appRoutes: this.routes,
                controller: this
            });
            this.router = new subrouter(this.prefix);
            this.navigate = $.proxy(function(route, options) {
                this.router.navigate(route, options);
            }, this);
        },

        _configureEvents: function(options) {
            options || (options = {});
            if (this.events) {
                _.each(['reply', 'comply', 'on'], function(type) {
                    if (this.events[type]) {
                        _.each(this.events[type], function(method, e) {
                            if (_.isFunction(method)) {
                                this[type](e, method);
                            } else if (_.isFunction(this[method])) {
                                this[type](e, this[method]);
                            }
                        }, this);
                    }
                }, this);
            }
        },

        _destroyEvents: function(options) {
            this.stopListening();
            this.stopComplying();
            this.stopReplying();
        },

        _configureChannels: function(options) {
            options || (options = {});
            if (this.channels) {
                _.each(_.keys(this.channels), function(ch) {
                    // Configure the channel
                    var channelName = (this.channels[ch].name || 'global');
                    this[ch] = Backbone.Radio.channel((this.channels[ch].name || 'global'));
                    if (options.debug) {
                        Backbone.Radio.tuneIn(channelName);
                    }

                    // Bind to events
                    if (this.channels[ch].events) {
                        _.each(['comply', 'reply', 'on'], function(method) {
                            if (this.channels[ch].events[method]) {
                                _.each(_.pairs(this.channels[ch].events[method]), function(hash) {
                                    if (_.isFunction(hash[1])) {
                                        this[ch][method](hash[0], hash[1]);
                                    } else if (_.isFunction(this[hash[1]])) {
                                        this[ch][method](hash[0], this[hash[1]]);
                                    }
                                }, this);
                            }
                        }, this);
                    }
                }, this);
            }
        },

        _destroyChannels: function(options) {
            options || (options = {});
            var methodMap = {
                comply: 'stopComplying',
                reply: 'stopReplying',
                on: 'off'
            };

            if (this.channels) {
                _.each(_.keys(this.channels), function(ch) {
                    if (this.channels[ch].events) {
                        _.each (_.keys(this.channels[ch].events), function(omethod) {
                            var method = (methodMap[omethod] || null);
                            if (method) {
                                //if (method == 'off') this[ch].off();
                                this[ch][method](null, null, this);
                                if (options.debug) {
                                    Backbone.Radio.tuneOut(this[ch].channelName);
                                }
                            }
                        }, this);
                    }
                }, this);
            }
        },

        triggerMethodOn: Marionette.triggerMethodOn
    });
    //endregion

    //  M.ModelMapView
    //  --------------

    //region ModelMapView
    var ModelMapView = M.ModelMapView = Marionette.ItemView.extend({
        mapId: null,
        renderChild: function(view, selector) {
            var el = (selector instanceof $) ? selector : this.$(selector);
            view.setElement(el).render();
        },
        render: function() {
            this._validate();
            Marionette.ItemView.prototype.render.call(this);
            this.collection.each(function(model) {
                var view = new this.childView({model: model});
                this.renderChild(view, this.mapId(model));
            }, this);
        },
        _validate: function() {
            if (!this.collection) throw new Error('ModelMapView requires a collection.');
            if (!this.childView) throw new Error('ModelMapView requires a childView to be specified.');
            if (!(this.childView instanceof Backbone.View) && (!this.childView instanceof Marionette.View)) throw new Error('ModelMapView: Invalid ChildView');
            if (!this.mapId || !_.isFunction(this.mapId)) throw new Error('ModelMapView requires a valid mapId function.');
        }
    });
    //endregion

    //	M.ModalView
    //	-----------

    //region ModalView
    var ModalView = M.ModalView = Marionette.ItemView.extend({
        initialize: function () {
            var model = new Backbone.Model({
                title: 'Warning',
                message: 'Are you sure?'
            });
            this.model = model;
            this.resetPromise();
        },

        ui: {
            cancel: 'button.js-cancel',
            continue: 'button.js-continue',
            dialogue: 'div#modal'
        },

        events: {
            'click @ui.cancel': 'cancelled',
            'click @ui.continue': 'continued'
        },

        modelEvents: {
            'change': 'render'
        }
    });

    _.extend(M.ModalView.prototype, {
        onLaunch: function() {
            this.ui.dialogue.modal('show');
        },

        onHide: function() {
            this.ui.dialogue.modal('hide');
        },

        _conclude: function(e, method) {
            e.preventDefault();
            e.stopPropagation();
            var d = this.model.get ('deferred');
            d[method] ();
            this.resetPromise();
            this.onHide();
        },

        cancelled: function(e) {
            this._conclude(e, 'reject');
        },

        continued: function(e) {
            this._conclude(e, 'resolve');
        },

        resetPromise: function() {
            var defer = $.Deferred(),
                m = this.model;
            _.each(['deferred', 'promise'], function(attr) {
                m.unset(attr, {silent: true});
            });
            m.set({
                deferred: defer,
                promise: defer.promise()
            });
        },

        onDomRefresh: function() {
            var m = this.model,
                d = m.get('deferred');
            this.ui.dialogue.on('hidden.bs.modal', $.proxy(function(e) {
                if (d.state() == 'pending') {
                    d.reject('dismissed');
                    this.resetPromise();
                }
            }, this));
        },

        onDestroy: function() {
            this.stopListening();
        }
    });

    //endregion

    //	Utility Functions
    //	-----------------

    //region Utilities
    M.dollarize = function(n, decimals, dollarSign, divisor) {
        // Configure defaults
        decimals = (decimals && !isNaN(decimals)) ? parseInt(decimals) : 2;
        dollarSign = dollarSign ? true : false;
        divisor = (divisor && !isNaN(divisor)) ? parseFloat(divisor) : 1;

        var res = '';
        if (dollarSign) res += '$';
        if (!isNaN(n)) {
            res += n.toFixed(decimals).replace(/./g, function (c, i, a) {
                return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
            });
            return res;
        }
        return '';
    };

    M.Format = function(val, format, options) {
        options || (options = {});
        var decimals = (options.hasOwnProperty('decimal')) ? options.decimal : 2,
            divisor = options.divisor || 1,
            res = '';

        if (!format) return val;
        switch(format) {
            case '$':
                if (isNaN(val)) return val;
                val = val / divisor;
                if (val < 0) res += '-';
                res += '$';
                res += Math.abs(val).toFixed(decimals).replace(/./g, function (c, i, a) {
                    return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
                });
                return res;
                break;
            case ',':
                if (isNaN(val)) return val;
                val = val / divisor;
                res += val.toFixed(decimals).replace(/./g, function (c, i, a) {
                    return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
                });
                return res;
                break;
            case '%':
                if (isNaN(val)) return val;
                val = val / divisor;
                res += val.toFixed(decimals).replace(/./g, function (c, i, a) {
                    return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
                });
                res += '%';
                return res;
                break;
            case '//':
                if (!(val instanceof Date)) return val;
                return (val.getMonth() + 1) + '/' + val.getDate() + '/' + val.getFullYear();
                break;
            case '///':
                if (!(val instanceof Date)) return val;
                var m = (val.getMonth() + 1).toString(),
                    d = val.getDate().toString(),
                    y = val.getFullYear().toString();
                return (m.length==1?'0':'') + m + '/' + (d.length==1?'0':'') + d + '/' + y;
                break;
            default:
                return val;
                break;
        }
    };

    M.getDayOfWeek = function(date, day, week) {
        week = week === undefined ? 1 : week;
        date = new Date(date);
        var o = date.getDate(),
            d = new Date(date.setDate(o + (7*week))),
            a = day - 7,
            b = day,
            day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? a : b);
        return new Date(d.setDate(diff));
    };

    return M;
}));