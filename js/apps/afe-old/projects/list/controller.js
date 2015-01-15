define([
    'app',
    'apps/afe/models',
    'apps/afe/projects/list/views',
    'apps/afe/projects/list/tasks/list/views'
], function (App, Models, Views, TaskViews) {
    App.module('AFE.Projects.List', {
        define: function (List, App, Backbone, Marionette, $, _) {
            List.Controller = M.Controller.extend({
                // Configure Radio
                channels: {
                    channel: {},
                    intercom: {
                        name: 'afe',
                        events: {
                            comply: {
                                'list:projects': 'showProjectList'
                            }
                        }
                    }
                },

                // Main Methods
                init: function() {
                    var layout = new Views.LayoutView();
                    this.views.add({name: 'layout', view: layout});
                    this.intercom.command('layout:show', layout, 'contentRegion');
                    this.showProjectList();
                },

                showProjectList: function() {
                    var layout = this.views.get('layout'),
                        name = 'projects',
                        id_xhr = this.channel.request('current:user', 'id');

                    $.when(id_xhr).done($.proxy(function(id) {
                        // Collection
                        var collection = new Models.Projects(null, {currentUser: id});
                        this.collections.add({
                            name: name,
                            collection: collection
                        });
                        collection.fetch();

                        // View
                        var view = new Views.ListView({collection: collection});
                        this.views.add({
                            name: name,
                            view: view,
                            events: {
                                'new:project': 'newProject',
                                'childview:view:history': 'viewHistory',
                                'childview:edit:project': 'editProject',
                                'childview:view:project': 'viewProject'
                            }
                        });

                        // Show it
                        layout.projectsRegion.show(view);
                    }, this));

                    this.showUserTaskList();
                },

                showUserTaskList: function() {
                    var layout = this.views.get('layout'),
                        tasks = new Models.Tasks(),
                        taskView = new TaskViews.List({
                            collection: tasks
                        }),
                        id_xhr = this.channel.request('current:user', 'id');

                    this.collections.add({name: 'tasks', collection: tasks});
                    this.views.add({
                        name: 'tasks',
                        view: taskView,
                        events: {
                            'childview:click:task': 'clickTask'
                        }
                    });

                    layout.tasksRegion.show(taskView);
                    $.when(id_xhr).done(function(id) {
                        tasks.fetch({userID: id});
                    });
                },

                clickTask: function(args) {
                    console.log(args.model);
                },

                // API
                newProject: function() {
                    this.intercom.command('new:project');
                },

                editProject: function(childview, args) {
                    this.intercom.command('edit:project', args.model);
                },

                viewHistory: function(childview, args) {
                    this.intercom.command('view:history', args.model);
                },

                viewProject: function(childview, args) {
                    this.intercom.command('view:project', args.model);
                }
            })
        }
    });

    return App.AFE.Projects.List;
});