define([
    'app',
    'apps/afe/models',
    'apps/afe/tasks/list/views'
], function (App, Models, Views) {
    App.module('AFE.Tasks.List', {
        define: function (List, App, Backbone, Marionette, $, _) {
            List.Controller = M.Controller.extend({
                channels: {
                    channel: {},
                    intercom: {
                        name: 'afe'
                    }
                },

                init: function(options) {
                    this.showUserTaskList();
                },

                showUserTaskList: function() {
                    var name = 'userTaskList',
                        tasks = new Models.Tasks(),
                        taskView = new Views.List({
                            collection: tasks
                        }),
                        id_xhr = this.channel.request('current:user', 'id');

                    this.collections.add({
                        name: name,
                        collection: tasks
                    });

                    this.views.add({
                        name: name,
                        view: taskView,
                        events: {
                            'childview:click:task': 'clickTask'
                        }
                    });

                    $.when(id_xhr).then($.proxy(function(id) {
                        // Request the tasks for the user and show the view
                        tasks.fetch({
                            userID: id,
                            success: $.proxy(function() {
                                this.intercom.command('layout:show', this.views.get(name), 'sideRegion');
                            }, this)
                        })
                    }, this));
                },

                clickTask: function(args) {
                    console.log(args.model);
                }
            });
        }
    });

    return App.AFE.Tasks.List;
});