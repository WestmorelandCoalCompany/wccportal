define([
    'app',
    'hbs!apps/afe/projects/list/templates/layout',
    'hbs!apps/afe/projects/list/templates/projectList',
    'hbs!apps/afe/projects/list/templates/empty',
    'hbs!apps/afe/projects/list/templates/item'
], function (App, layoutTpl, projectTpl, emptyTpl, itemTpl) {
    App.module('AFE.Projects.List.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.LayoutView = Marionette.LayoutView.extend({
                template: layoutTpl,
                regions: {
                    tasksRegion: '#afe-tasks',
                    projectsRegion: '#afe-projects'
                }
            });

            Views.EmptyView = Marionette.ItemView.extend({
                template: emptyTpl
            });

            Views.ItemView = Marionette.ItemView.extend({
                // Configuration
                template: itemTpl,
                tagName: 'tr',
                templateHelpers: {
                    allowedToEdit: function() {
                        return this.model.collection.currentUser == this.model.attributes.AuthorId;
                    },
                    status: function() {
                        return this.model.attributes.AFE_x0020_Approval &&
                            this.model.attributes.AFE_x0020_Approval.Description;
                    }
                },

                ui: {
                    history: 'a.js-history',
                    edit: 'button.js-edit',
                    summary: 'button.js-summary'
                },

                triggers: {
                    'click @ui.history': 'view:history',
                    'click @ui.edit': 'edit:project',
                    'click @ui.summary': 'view:project'
                }
            });

            Views.ListView = Marionette.CompositeView.extend({
                // Configuration
                template: projectTpl,
                tagName: 'div',
                emptyView: Views.EmptyView,

                // Child View
                childView: Views.ItemView,
                childViewContainer: 'tbody',

                ui: {
                    new: 'button.js-new'
                },

                events: {
                    'click @ui.new': 'clickNew'
                },

                clickNew: function(e) {
                    this.trigger('new:project');
                }
            })
        }
    });

    return App.AFE.Projects.List.Views;
});