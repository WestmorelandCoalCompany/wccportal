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
                template: FormTpl,
                tagName: 'div',
                className: 'col-sm-12',

                //  UI
                ui: {
                    back: 'button.js-back',
                    control: '#Week_Begin',
                    delete: 'button.js-delete',
                    message: '#form-message',
                    save: 'button.js-save',
                    submit: 'button.js-submit'
                },

                //  Events
                triggers: {
                    'click @ui.back': 'back',
                    'click @ui.delete': 'delete',
                    'click @ui.save': 'save',
                    'click @ui.submit': 'publish'
                },

                modelEvents: {
                    'sync': 'render'
                },

                changeDate: function() {
                    if (this.model) this.model.set('Week_Begin', this.ui.control.datepicker('getDate'));
                },

                onShowError: function(msg) {
                    msg = '<strong>Error!</strong> ' + msg;
                    this._showMessage(msg, 'alert alert-danger');
                },

                onShowSuccess: function(msg) {
                    msg = '<strong>Success!</strong> ' + msg;
                    this._showMessage(msg, 'alert alert-success');
                },

                _showMessage: function(msg, classes) {
                    this.ui.message.removeClass();
                    this.ui.message.addClass(classes);
                    this.ui.message.html(msg);
                },

                //  Bindings
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
                    '#MSHA_Weekly_Hourly': {observe: 'MSHA_Weekly_Hourly', onGet: 'numToText', onSet: 'textToNum'},
                    '#MSHA_Weekly_Salaried': {observe: 'MSHA_Weekly_Salaried', onGet: 'numToText', onSet: 'textToNum'},
                    '#MSHA_Weekly_Contractor': {observe: 'MSHA_Weekly_Contractor', onGet: 'numToText', onSet: 'textToNum'},
                    '#MSHA_YTD_Hourly': {observe: 'MSHA_YTD_Hourly', onGet: 'numToText', onSet: 'textToNum'},
                    '#MSHA_YTD_Salaried': {observe: 'MSHA_YTD_Salaried', onGet: 'numToText', onSet: 'textToNum'},
                    '#MSHA_YTD_Contractor': {observe: 'MSHA_YTD_Contractor', onGet: 'numToText', onSet: 'textToNum'},
                    '#LTI_YTD_Hourly': {observe: 'LTI_YTD_Hourly', onGet: 'numToText', onSet: 'textToNum'},
                    '#LTI_YTD_Salaried': {observe: 'LTI_YTD_Salaried', onGet: 'numToText', onSet: 'textToNum'},
                    '#LTI_YTD_Contractor': {observe: 'LTI_YTD_Contractor', onGet: 'numToText', onSet: 'textToNum'},
                    '#MSHA_Days_Since_Last': {observe: 'MSHA_Days_Since_Last', onGet: 'numToText', onSet: 'textToNum'},
                    '#LTI_Days_Since_Last': {observe: 'LTI_Days_Since_Last', onGet: 'numToText', onSet: 'textToNum'},
                    '#Safety_Comments': {observe: 'Safety_Comments'},

                    // Sales
                    '#Sales_Weekly_Actual': {observe: 'Sales_Weekly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_Weekly_Forecast': {observe: 'Sales_Weekly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_Weekly_Budget': {observe: 'Sales_Weekly_Budget', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_Monthly_Actual': {observe: 'Sales_Monthly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_Monthly_Forecast': {observe: 'Sales_Monthly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_Monthly_Budget': {observe: 'Sales_Monthly_Budget', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_YTD_Actual': {observe: 'Sales_YTD_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_YTD_Forecast': {observe: 'Sales_YTD_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Sales_YTD_Budget': {observe: 'Sales_YTD_Budget', onGet: 'numToText', onSet: 'textToNum'},
                    '#Customer_Comments': {observe: 'Customer_Comments'},

                    // Production
                    '#Draglines_Weekly_Actual': {observe: 'Draglines_Weekly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Draglines_Weekly_Forecast': {observe: 'Draglines_Weekly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Draglines_Monthly_Actual': {observe: 'Draglines_Monthly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Draglines_Monthly_Forecast': {observe: 'Draglines_Monthly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Weekly_Actual': {observe: 'Mobile_Weekly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Weekly_Forecast': {observe: 'Mobile_Weekly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Monthly_Actual': {observe: 'Mobile_Monthly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Monthly_Forecast': {observe: 'Mobile_Monthly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Production_Comments': {observe: 'Production_Comments'},

                    // Inventory
                    '#Beg_Pit_Inv': {observe: 'Beg_Pit_Inv', onGet: 'numToText', onSet: 'textToNum'},
                    '#Tons_Uncovered': {observe: 'Tons_Uncovered', onGet: 'numToText', onSet: 'textToNum'},
                    '#Tons_Produced': {observe: 'Tons_Produced', onGet: 'numToText', onSet: 'textToNum'},
                    '#Beg_Stockpile_Inv': {observe: 'Beg_Stockpile_Inv', onGet: 'numToText', onSet: 'textToNum'},
                    '#End_Stockpile_Inv': {observe: 'End_Stockpile_Inv', onGet: 'numToText', onSet: 'textToNum'},
                    '#Operations_Comments': {observe: 'Operations_Comments'}
                },

                //  Formatters
                textToNum: function(val, options) {
                    return parseFloat(val.replace(/[^0-9\.]+/g, ''));
                },

                numToText: function(val, options) {
                    return M.Format(val, ',', {decimal: 0})
                },

                //  Internal Methods
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
                },

                onDestroy: function() {
                    this.ui.control.datepicker().off('changeDate');
                }
            });
        }
    });

    return App.Weekly.Edit.Views;
});