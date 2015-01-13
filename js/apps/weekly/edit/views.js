define([
    'app',
    'apps/main/common/views',
    'hbs!apps/weekly/edit/templates/layout',
    'hbs!apps/weekly/edit/templates/entry',
    'hbs!apps/weekly/edit/templates/empty',
    'hbs!apps/weekly/edit/templates/list',
    'hbs!apps/weekly/edit/templates/form',
    'bootstrap.datepicker',
    'backbone.stickit'
], function (App, CommonViews, LayoutTpl, EntryTpl, EmptyTpl, ListTpl, FormTpl) {
    App.module('Weekly.Edit.Views', {
        initialize: function(options) {
            var handlers = [
                {
                    selector: 'input.js-weekly-input-number',
                    onGet: function(value, options) {
                        if (value) return M.Format(value, ',', {decimal: 0});
                        return '';
                    },
                    onSet: function(value, options) {
                        return parseFloat(value.replace(/[^0-9\.]+/g, ''));
                    }
                }
            ];
            Backbone.Stickit.addHandler(handlers);
        },

        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Common Views
            //  ------------
            Views.AlertView = CommonViews.AlertView.extend({});
            Views.ModalView = CommonViews.ModalView.extend({});



            //  Layout View
            //  -----------

            Views.LayoutView = Marionette.LayoutView.extend({
                template: LayoutTpl,
                className: 'col-sm-12',
                regions: {
                    alertRegion: '#weekly-alert',
                    contentRegion: '#weekly-edit-content'
                }
            });


            //  List Views
            //  ----------

            // List item
            Views.EntryView = Marionette.ItemView.extend({
                template: EntryTpl,
                tagName: 'tr',

                ui: {
                    edit: 'button.js-edit'
                },

                triggers: {
                    'click @ui.edit': 'edit'
                },

                bindings: {
                    '.Week_Begin': {observe: 'Week_Begin', onGet: 'formatDate'},
                    '.Created': {observe: 'Created', onGet: 'formatDate'},
                    '.Modified': {observe: 'Modified', onGet: 'formatDate'}
                },

                formatDate: function(val, options) {
                    return M.Format(val, '//');
                },

                render: function() {
                    Marionette.ItemView.prototype.render.call(this);
                    this.stickit();
                }
            });

            // Empty list item
            Views.EmptyView = Marionette.ItemView.extend({
                template: EmptyTpl,
                tagName: 'tr'
            });

            // List Container
            Views.ListView = Marionette.CompositeView.extend({
                // Configuration
                template: ListTpl,
                tagName: 'div',
                className: 'col-sm-12',
                emptyView: Views.EmptyView,

                childView: Views.EntryView,
                childViewContainer: 'tbody',

                // UI
                ui: {
                    add: 'button.js-add'
                },

                // Events
                triggers: {
                    'click @ui.add': 'add'
                },

                collectionEvents: {
                    'reset': 'render'
                }
            });



            // Form View
            //  --------

            Views.FormView = Marionette.ItemView.extend({
                //  Initializer
                //  -----------

                initialize: function(options) {
                    options || (options = {});
                    this.templateHelpers || (this.templateHelpers = {});
                    if (options.additionalHelpers) {
                        var helpers = _.extend((this.templateHelpers || {}), options.additionalHelpers);
                        this.templateHelpers = this.templateHelpers || {};
                    }
                    if (options.operations) this.templateHelpers.operationsList = options.operations;
                    if (options.date) this.templateHelpers.date = options.date;
                },



                //  Configuration
                //  -------------

                template: FormTpl,
                tagName: 'div',
                className: 'col-sm-12',

                // UI
                ui: {
                    back: 'button.js-back',
                    control: '#Week_Begin',
                    delete: 'button.js-delete',
                    message: '#form-message',
                    save: 'button.js-save',
                    submit: 'button.js-submit',
                    endingPit: '#ending-pit',
                    totalInv: '#total-inv'
                },



                //  Events
                //  -----------------------

                events: {
                    'keyup input.js-weekly-input-number': 'displayNumber'
                },

                triggers: {
                    'click @ui.back': 'back',
                    'click @ui.delete': 'delete',
                    'click @ui.save': 'save',
                    'click @ui.submit': 'publish'
                },

                modelEvents: {
                    'sync': 'render',
                    'change:Beg_Pit_Inv': 'updateEndingPit updateTotal',
                    'change:Tons_Uncovered': 'updateEndingPit updateTotal',
                    'change:Tons_Produced': 'updateEndingPit updateTotal',
                    'change:End_Stockpile_Inv': 'updateTotal'
                },



                //  Handlers
                //  --------

                // Update the date model via the datepicker widget
                changeDate: function(e) {
                    if (this.model) this.model.set('Week_Begin', this.ui.control.datepicker('getDate'));
                },

                // Format entered number as text
                displayNumber: function(e) {
                    var val = $(e.target).val().replace(/[^0-9\.]+/g, ''),
                        regex = /^-?$/g;
                    if (!(regex.test(val))) {
                        $(e.target).val(M.Format(parseFloat(val), ',', {decimal: 0}));
                    }
                },

                // Recalculate ending pit inventory
                updateEndingPit: function(e) {
                    var entry = this.model,
                        val = (entry.get('Beg_Pit_Inv') || 0) + (entry.get('Tons_Uncovered') || 0)
                            - (entry.get('Tons_Produced') || 0);
                    this.ui.endingPit.val(M.Format(val, ',', {decimal: 0}));
                },

                // Recalculate total inventory
                updateTotal: function(e) {
                    var entry = this.model,
                        val = (entry.get('Beg_Pit_Inv') || 0) + (entry.get('Tons_Uncovered') || 0)
                            - (entry.get('Tons_Produced') || 0) + (entry.get('End_Stockpile_Inv') || 0);
                    this.ui.totalInv.val(M.Format(val, ',', {decimal: 0}));
                },



                //  Bindings
                //  --------

                bindings: {
                    // Meta
                    '#Operation': {
                        observe: 'Operation',
                        selectOptions: {
                            collection: function() {
                                return this.templateHelpers.operationsList
                            },
                            labelPath: 'Title',
                            valuePath: 'Title'
                        }
                    },

                    // Safety
                    '#MSHA_Weekly_Hourly': 'MSHA_Weekly_Hourly',
                    '#MSHA_Weekly_Salaried': 'MSHA_Weekly_Salaried',
                    '#MSHA_Weekly_Contractor': 'MSHA_Weekly_Contractor',
                    '#MSHA_YTD_Hourly': 'MSHA_YTD_Hourly',
                    '#MSHA_YTD_Salaried': 'MSHA_YTD_Salaried',
                    '#MSHA_YTD_Contractor': 'MSHA_YTD_Contractor',
                    '#LTI_YTD_Hourly': 'LTI_YTD_Hourly',
                    '#LTI_YTD_Salaried': 'LTI_YTD_Salaried',
                    '#LTI_YTD_Contractor': 'LTI_YTD_Contractor',
                    '#MSHA_Days_Since_Last': 'MSHA_Days_Since_Last',
                    '#LTI_Days_Since_Last': 'LTI_Days_Since_Last',
                    '#Safety_Comments': 'Safety_Comments',

                    // Sales
                    '#Sales_Weekly_Actual': 'Sales_Weekly_Actual',
                    '#Sales_Weekly_Forecast': 'Sales_Weekly_Forecast',
                    '#Sales_Weekly_Budget': 'Sales_Weekly_Budget',
                    '#Sales_Monthly_Actual': 'Sales_Monthly_Actual',
                    '#Sales_Monthly_Forecast': 'Sales_Monthly_Forecast',
                    '#Sales_Monthly_Budget': 'Sales_Monthly_Budget',
                    '#Sales_YTD_Actual': 'Sales_YTD_Actual',
                    '#Sales_YTD_Forecast': 'Sales_YTD_Forecast',
                    '#Sales_YTD_Budget': 'Sales_YTD_Budget',
                    '#Customer_Comments': 'Customer_Comments',

                    // Production
                    '#Draglines_Weekly_Actual': 'Draglines_Weekly_Actual',
                    '#Draglines_Weekly_Forecast': 'Draglines_Weekly_Forecast',
                    '#Draglines_Monthly_Actual': 'Draglines_Monthly_Actual',
                    '#Draglines_Monthly_Forecast': 'Draglines_Monthly_Forecast',
                    '#Mobile_Weekly_Actual': 'Mobile_Weekly_Actual',
                    '#Mobile_Weekly_Forecast': 'Mobile_Weekly_Forecast',
                    '#Mobile_Monthly_Actual': 'Mobile_Monthly_Actual',
                    '#Mobile_Monthly_Forecast': 'Mobile_Monthly_Forecast',
                    '#Production_Comments': 'Production_Comments',

                    // Inventory
                    '#Beg_Pit_Inv': 'Beg_Pit_Inv',
                    '#Tons_Uncovered': 'Tons_Uncovered',
                    '#Tons_Produced': 'Tons_Produced',
                    '#Beg_Stockpile_Inv': 'Beg_Stockpile_Inv',
                    '#End_Stockpile_Inv': 'End_Stockpile_Inv',
                    '#Operations_Comments': 'Operations_Comments'
                },



                //  Internal Methods
                //  ----------------

                render: function() {
                    Marionette.ItemView.prototype.render.call(this);
                    if (this.model) this.stickit();
                },

                onRender: function() {
                    // Remove delete button if new
                    if (this.model.isNew()) {
                        this.ui.delete.remove();
                    }

                    // Remove publish button if already published
                    if (this.model.get('Published')) {
                        this.ui.submit.remove();
                        this.ui.save.css('margin-right', '0');
                    }

                    // Initialize the datepicker
                    this.ui.control.datepicker({
                        orientation: 'top right',
                        daysOfWeekDisabled: '0,2,3,4,5,6',
                        autoclose: true
                    });
                    this.ui.control.datepicker('setDate', this.model.get('Week_Begin'));
                    this.ui.control.datepicker().on('changeDate', $.proxy(function() {
                        this.changeDate();
                    }, this));

                    // Perform initial inventory calculations
                    this.updateEndingPit();
                    this.updateTotal();
                },

                onDestroy: function() {
                    this.ui.control.datepicker().off('changeDate');
                }
            });
        }
    });

    return App.Weekly.Edit.Views;
});