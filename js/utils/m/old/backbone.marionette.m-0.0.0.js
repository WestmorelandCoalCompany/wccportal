define ([
    'underscore',
    'backbone',
    'marionette',
    'backbone.radio.shim',
    'backbone.picky',
    'backbone.sp',
    'backbone.relational'
], function(_, Backbone, Marionette) {

    var Machine = Backbone.Machine = {};

    var BackboneRM = Backbone.RelationalModel;
    var Model = Machine.Model = _.extend(BackboneRM, Backbone.SP.Item);

    //  M.Container
    //  -----------

    //region Container
    var Container = Machine.Container = function(contents, options) {
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

    _.extend(Container.prototype, Backbone.Events, {
        // Provide an empty initialize function
        initialize: function() {},

        // Add contents
        add: function(objs, options) {
            options || (options = {});
            _.defaults(options, addOptions);
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
                if (this.contents[hash.name] && (this.contents[hash.name] == obj)) {
                    this.remove(hash.name, options);
                }
                this.contents[hash.name] = obj;

                // Bind events
                if (hash.events) {
                    var self = this.controller || this;
                    this.bindEntityEvents(self, obj, hash.events);
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

    //region Controller
    Machine.Controller = Marionette.Controller.extend({
        initialize: function(options) {
            _.bindAll.apply(_, [this].concat(_.functions(this)));

            options || (options = {});
            this.cid = _.uniqueId('c');

            // Configure Containers
            _.each(['controllers', 'models', 'collections', 'views'], function(container) {
                var type = container.substr(0, container.length - 1),
                    options = {
                        type: type,
                        controller: this
                    };
                var c = new Container(null, options);
                this[container] = c;
            }, this);

            // Configure Events
            this._configureChannels(options);

            // Handle destroy
            this.on('destroy', function() {
                // destroy container contents
                _.each(['controllers', 'collections', 'views', 'models'], function(container) {
                    this[container].destroy();
                    delete this[container];
                }, this);

                // unbind events
                this._destroyChannels(options);
                delete this;
            }, this);

            // Call init function if available
            if (_.isFunction(this.init)) {
                this.init(options);
            }
        },

        getCollection: function(name, options) {
            options || (options = {});
            var defer = $.Deferred(),
                collection = this.collections.get(name);

            $.extend(options, {
                success: function() {
                    defer.resolve(collection);
                }
            });

            if (collection) {
                if (collection.length == 0 || options.update) {
                    collection.fetch(options);
                }
                else {
                    defer.resolve(collection);
                }
            }
            else {
                defer.fail();
            }

            return defer.promise();
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
                                console.log('Controller.' + ch + '.' + method + '(null, null, this);');
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

        // Enable easy overriding of the default `RegionManager`
        // for customized region interactions and business specific
        // view logic for better control over single regions.
        getRegionManager: function() {
            return new Marionette.RegionManager();
        },

        // Internal method to initialize the region manager
        // and all regions in it
        _initRegionManager: function() {
            this.regionManager = this.getRegionManager ();

            this.listenTo (this.regionManager, 'before:add:region', function(name) {
                this.triggerMethod ('before:add:region', name);
            });

            this.listenTo (this.regionManager, 'add:region', function(name, region) {
                this[name] = region;
                this.triggerMethod ('add:region', name, region);
            });

            this.listenTo (this.regionManager, 'before:remove:region', function(name) {
                this.triggerMethod ('before:remove:region', name);
            });

            this.listenTo (this.regionManager, 'remove:region', function(name, region) {
                delete this[name];
                this.triggerMethod ('remove:region', name, region);
            });
        }
    });
    //endregion

    //  M.ModelMapView
    //  --------------

    //region ModelMapView

    //endregion

    window.Machine = Machine;
    return Machine;
});