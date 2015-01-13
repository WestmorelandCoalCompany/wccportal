define([
    'app',
    'apps/main/common/views',
    'hbs!apps/weekly/common/templates/layout',
    'hbs!apps/weekly/common/templates/opMenuItem',
    'hbs!apps/weekly/common/templates/opMenu',
    'hbs!apps/weekly/common/templates/dateMenu'
], function (App, CommonViews, LayoutTpl, OpMenuItemTpl, OpMenuTpl, DateMenuTpl) {
    App.module('Weekly.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Generic Views
            //  -------------

            // Modal View
            Views.ModalView = CommonViews.ModalView.extend();

            // Alert View
            Views.AlertView = CommonViews.AlertView.extend();

            //  Application Layout View
            //  -----------------------
            Views.LayoutView = Marionette.LayoutView.extend({
                // Configuration
                template: LayoutTpl,
                className: 'container',
                regions: {
                    contentRegion: '#weekly-content',
                    dateMenuRegion: '#weekly-date-menu',
                    opMenuRegion: '#weekly-op-menu',
                    modalRegion: '#weekly-modal'
                },

                ui: {
                    title: '#weekly-title',
                    dateRange: '#weekly-daterange',
                    button: '#weekly-report-edit'
                },

                // Events
                events: {
                    'click @ui.button': 'navigate'
                },

                // Event handlers
                navigate: function() {
                    var text = this.ui.button.text();
                    if (/Edit/g.test(text)) {
                        this.trigger('edit');
                    }
                    else {
                        this.trigger('report');
                    }
                },

                // External event handlers
                onChangeTitle: function(operation) {
                    var titlePrefix = operation || 'Westmoreland',
                        titleSuffix = ' Weekly Report';
                    this.ui.title.text((titlePrefix + titleSuffix));
                },

                onChangeDateRange: function(d) {
                    var date = d || new Date();
                    this.ui.dateRange.text(date);
                },

                onToggleMenu: function(toEdit) {
                    if (toEdit) {
                        this.ui.button.html('<span class="glyphicon glyphicon-backward"></span> Back to Report');
                    }
                    else {
                        this.ui.button.html('<span class="glyphicon glyphicon-edit"></span> Edit');
                    }
                },

                // Internal Methods
                onRender: function() {
                    this.triggerMethod('change:title');
                    this.triggerMethod('change:date:range');
                }
            });



            //  Operation Drop Down Menu
            //  ------------------------
            Views.OpMenuItemView = Marionette.ItemView.extend({
                template: OpMenuItemTpl,
                tagName: 'li',

                events: {
                    'click a': 'navigate'
                },

                navigate: function(e) {
                    e.preventDefault();
                    Backbone.Radio.request('main:api', 'operations:change', this.model.get('Title'));
                }
            });

            Views.OpMenuView = Marionette.CompositeView.extend({
                template: OpMenuTpl,
                tagName: 'ul',
                className: 'nav navbar-nav',
                childView: Views.OpMenuItemView,
                childViewContainer: 'ul',

                ui: {
                    title: 'span#op-toggle'
                },

                collectionEvents: {
                    'select:one': 'changeOp'
                },

                changeOp: function() {
                    this.ui.title.text(this.collection.selected.get('Title'));
                },

                onRender: function() {
                    if (this.collection.selected) this.changeOp();
                }
            });



            //  Date Menu
            //  ---------
            Views.DateMenuView = Marionette.ItemView.extend({
                template: DateMenuTpl,

                ui: {
                    date: '#weekly-date-control'
                },

                // change the datepicker date
                onSetDate: function(date) {
                    this.ui.date.datepicker('update', date);
                },

                onRender: function() {
                    // initialize the datepicker control
                    this.ui.date.datepicker({
                        autoclose: true,
                        format: 'mm/dd/yyyy',
                        orientation: 'top right',
                        todayHighlight: false,
                        forceParse: true,
                        daysOfWeekDisabled: [0,2,3,4,5,6]
                    });
                    // bind to the 'changeDate' control event and update the model
                    this.ui.date.datepicker().on('changeDate', _.bind(function(e) {
                        this.model.update(e.date);
                        this.triggerMethod('set:date', this.model.get('date'));
                    }, this));
                    // Set the date when first initialized
                    if (this.model) this.triggerMethod('set:date', this.model.get('date'));
                }
            });
        }
    });

    return App.Weekly.Common.Views;
});