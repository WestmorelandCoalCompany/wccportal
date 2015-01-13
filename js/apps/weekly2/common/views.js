define([
    'app',
    'hbs!apps/weekly/common/templates/opItem',
    'hbs!apps/weekly/common/templates/opLayout',
    'hbs!apps/weekly/common/templates/dateItem',
    'bootstrap.datepicker',
    'backbone.stickit'
], function (App, opItemTpl, opLayoutTpl, dateItemTpl) {
    App.module('Weekly.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Operation Drop-down menu
            //  ------------------------
            Views.OperationItem = Marionette.ItemView.extend({
                template: opItemTpl,
                tagName: 'li',

                events: {
                    'click a': 'selectOperation'
                },

                selectOperation: function() {
                    this.model.select();
                    this.trigger('select:operation');
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
                    if (this.collection.selected) {
                        this.ui.activeOp.text(this.collection.selected.get('Title'));
                    }
                }
            });

            //  Date Picker Widget
            //  ------------------
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
                    'click @ui.update': 'changeDate'
                },

                changeDate: function() {
                    this.model.updateDate(this.ui.control.datepicker('getDate'));
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
                }
            });
        }
    });

    return App.Weekly.Common.Views;
});