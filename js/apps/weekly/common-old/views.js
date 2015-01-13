define([
    'app',
    'hbs!apps/weekly/common/templates/layout',
    'hbs!apps/weekly/common/templates/opItem',
    'hbs!apps/weekly/common/templates/opLayout',
    'hbs!apps/weekly/common/templates/dateItem',
    'hbs!apps/main/common/templates/modal',
    'bootstrap.datepicker',
    'backbone.stickit',
], function (App, layoutTpl, opItemTpl, opLayoutTpl, dateItemTpl, ModalTpl) {
    App.module('Weekly.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Date Picker Widget
            Views.DateMenuView = Marionette.ItemView.extend({
                template: dateItemTpl,
                tagName: 'form',
                className: 'navbar-form',
                attributes: {
                    'role': 'search'
                },

                ui: {
                    control: '#weekly-date',
                    update: '#weekly-date-update'
                },

                events: {
                    'click @ui.update': 'onChangeDate'
                },

                onChangeDate: function(options) {
                    options || (options = {});
                    if (!options.skip) this.model.updateDate(this.ui.control.datepicker('getDate'));
                    this.trigger('change:date');
                },

                onRender: function() {
                    this.ui.control.datepicker({
                        orientation: 'top right',
                        daysOfWeekDisabled: '0,6',
                        autoclose: true,
                        todayHighlight: true
                    });
                    this.ui.control.datepicker('setDate', this.model.get('date'));
                    Marionette.triggerMethodOn(this, 'change:date', {skip: true});
                }
            });

            //  Layout
            Views.LayoutView = Marionette.LayoutView.extend({
                template: layoutTpl,
                regions: {
                    opMenu: '#weekly-op-menu',
                    dateMenu: '#weekly-date-menu',
                    content: '#weekly-content'
                },

                ui: {
                    edit: 'a#weekly-edit',
                    next: 'button.js-next',
                    prev: 'button.js-previous',
                    title: '#active-operation'
                },

                triggers: {
                    'click @ui.edit': 'edit',
                    'click @ui.next': 'next',
                    'click @ui.prev': 'prev'
                },

                onUpdateTitle: function(title) {
                    if (!this.isDestroyed) this.ui.title.text(title);
                },

                onDestroy: function() {
                    console.log('Destroying layout');
                }
            });

            //  Weekly Modal
            Views.ModalView = M.ModalView.extend({
                template: ModalTpl
            });

            //  Operation Drop-down menu
            Views.OperationItem = Marionette.ItemView.extend({
                template: opItemTpl,
                tagName: 'li',

                triggers: {
                    'click a': 'select:operation'
                }
            });

            Views.OperationMenuView = Marionette.CompositeView.extend({
                template: opLayoutTpl,
                tagName: 'ul',
                className: 'nav navbar-nav',
                childView: Views.OperationItem,
                childViewContainer: 'ul',

                ui: {
                    activeOp: '#active-operation'
                },

                collectionEvents: {
                    'select:one': 'render'
                },

                onRender: function() {
                    if (this.collection && this.collection.selected) {
                        this.ui.activeOp.text(this.collection.selected.get('Title'));
                    }
                }
            });
        }
    });

    return App.Weekly.Common.Views;
});