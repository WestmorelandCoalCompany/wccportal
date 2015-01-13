define([
    'app',
    'apps/afe/models',
    'apps/afe/views'
], function (App, Models, Views) {
    App.module('AFE', {
        define: function (AFE, App, Backbone, Marionette, $, _) {
            AFE.Controller = M.Controller.extend({
                // Configuration
                channels: {
                    intercom: {
                        name: 'afe',
                        events: {
                            reply: {
                                'modal:promise': 'getModalPromise'
                            },
                            comply: {
                                'layout:show': 'showViewInLayout',
                                'show:modal': 'showModal',
                                'new:project': 'showNewForm',
                                'show:projects': 'showProjectList'
                            }
                        }
                    }
                },

                // Init Methods
                init: function() {
                    var user_xhr = this.getCurrentUser();
                    this.initLayout();
                    this.initModal();
                    $.when(user_xhr).then($.proxy(function() {
                        this.showProjectList();
                    }, this));
                },

                initLayout: function() {
                    this.views.add({
                        name: 'layout',
                        view: new Views.LayoutView()
                    });
                    App.mainRegion.show(this.views.get('layout'));
                },

                initModal: function() {
                    var modalView = new Views.ModalView();
                    this.views.add({
                        name: 'modal',
                        view: modalView
                    });
                    this.showViewInLayout(modalView, 'modalRegion');
                },

                // Show Methods
                showNewForm: function() {
                    require(['apps/afe/projects/new/controller'], $.proxy(function(C) {
                        App.navigate('afe/new');
                        this.controllers.add({
                            name: 'app',
                            controller: new C.Controller({debug: App.debug})
                        });
                    }, this));
                },

                showProjectList: function() {
                    require(['apps/afe/projects/list/controller'], $.proxy(function(C) {
                        App.navigate('afe');
                        this.controllers.add({
                            name: 'app',
                            controller: new C.Controller({debug: App.debug})
                        });
                    }, this));
                },

                showUserTaskList: function() {
                    require(['apps/afe/tasks/list/controller'], $.proxy(function(C) {
                        this.controllers.add({
                            name: 'sideBar',
                            controller: new C.Controller({debug: App.debug})
                        });
                    }, this));
                },

                // API
                getCurrentUser: function() {
                    var defer = $.Deferred();
                    require(['apps/main/user/controller'], $.proxy(function(C) {
                        // Initialize the controller
                        this.controllers.add({
                            name: 'user',
                            controller: new C.Controller({debug: App.debug})
                        });
                        defer.resolve();
                    }, this));
                    return defer.promise();
                },

                getModalPromise: function() {
                    return this.views.get('modal').model.get('promise')
                },

                showModal: function(title, msg) {
                    var modalView = this.views.get('modal'),
                        model = modalView.model;
                    model.set({
                        title: title,
                        message: msg
                    });
                    Marionette.triggerMethodOn(modalView, 'launch');
                },

                showViewInLayout: function(view, region) {
                    this.views.get('layout')[region].show(view);
                }
            })
        }
    });

    return App.AFE;
});