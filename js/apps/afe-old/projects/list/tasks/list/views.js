define([
    'app',
    'hbs!apps/afe/projects/list/tasks/list/templates/item',
    'hbs!apps/afe/projects/list/tasks/list/templates/empty',
    'hbs!apps/afe/projects/list/tasks/list/templates/layout',
], function (App, itemTpl, emptyTpl, layoutTpl) {
    App.module('AFE.Tasks.List.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.Item = Marionette.ItemView.extend({
                template: itemTpl,
                tagName: 'li',
                className: 'list-group-item',

                templateHelpers: {
                    showLabel: function() {
                        var due = parseInt(this.model.get('dueIn'));
                        return due <= 7;

                    },
                    labelStatus: function() {
                        var due = parseInt(this.model.get('dueIn'));
                        if (isNaN(due)) {
                            return 'default';
                        } else {
                            if (due < 0) {
                                return 'danger'
                            } else if (due <= 1) {
                                return 'warning'
                            } else {
                                return 'default';
                            }
                        }
                    },
                    labelMsg: function() {
                        var due = parseInt(this.model.get('dueIn'));
                        if (isNaN(due)) {
                            return false;
                        } else {
                            if (due < 0) {
                                return 'Overdue'
                            }
                            else if (due == 0) {
                                return 'Due Today';
                            }
                            else {
                                var res = 'Due in ' + due + ' day';
                                if (due > 1) {
                                    res += 's'
                                }
                                return res;
                            }
                        }
                    }
                },

                triggers: {
                    'click a': 'click:task'
                }
            });

            Views.Empty = Marionette.ItemView.extend({
                template: emptyTpl,
                tagName: 'li',
                className: 'list-group-item'
            });

            Views.List = Marionette.CompositeView.extend({
                template: layoutTpl,
                tagName: 'div',
                emptyView: Views.Empty,

                childView: Views.Item,
                childViewContainer: 'div#tasks',

                templateHelpers: {
                    count: function() {
                        return this.collection.length;
                    }
                },

                collectionEvents: {
                    'sync': 'render'
                }
            });
        }
    });

    return App.AFE.Tasks.List.Views;
});