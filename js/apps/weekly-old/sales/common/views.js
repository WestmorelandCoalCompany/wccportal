define([
    'app',
    'hbs!apps/weekly/sales/common/templates/form',
    'backbone.syphon'
], function (App, formTpl) {
    App.module('Weekly.Sales.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.FormView = Marionette.ItemView.extend({
                // Configuration
                template: formTpl,
                tagName: 'form',
                attributes: {
                    'role': 'form'
                },

                // UI
                ui: {
                    cancel: 'button.js-cancel',
                    delete: 'button.js-delete',
                    input: 'input.js-input',
                    message: '#sales-message',
                    operation: 'select#sales-operations',
                    save: 'button.js-save',
                    title: '.js-title',
                    weekBegin: 'input#sales-week-begin',
                    weekEnd: 'input#sales-week-end'
                },

                // Events
                events: {
                    'click @ui.cancel': 'clickCancel',
                    'click @ui.delete': 'clickDelete',
                    'keyup @ui.input': 'formatValue',
                    'click @ui.save': 'clickSave'
                },

                // Event Handlers
                clickCancel: function(e) {
                    this.intercom.command('cancel');
                },

                clickDelete: function(e) {
                    if (this.model) {
                        this.intercom.command('delete:entry', this.model);
                    }
                },

                clickSave: function(e) {
                    var data = Backbone.Syphon.serialize(this);
                    if (this.model) {
                        this.model.set(data);
                        this.intercom.command('form:submit', this.model);
                    }
                    else {
                        this.intercom.command('form:submit', data);
                    }
                },

                formatValue: function(e) {
                    var num = $(e.target).val();
                    if (!num) {return;};
                    if ($.type(num) === 'string') {
                        num = parseFloat(num.replace(/[^0-9.]/g, ''));
                    }
                    num || (num = 0);
                    $(e.target).val(num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                },

                showError: function(msg) {
                    this.ui.message.removeClass();
                    this.ui.message.addClass('alert alert-danger');
                    msg = '<strong>Error!</strong> ' + msg;
                    this.ui.message.html(msg);
                },

                showSuccess: function(msg) {
                    this.ui.message.removeClass();
                    this.ui.message.addClass('alert alert-success');
                    msg = '<strong>Success!</strong> ' + msg;
                    this.ui.message.html(msg);
                },

                // Internal Methods
                onRender: function() {
                    // Initialize DatePicker widgets
                    this.ui.weekBegin.datepicker({
                        orientation: "top right",
                        calendarWeeks: true,
                        autoclose: true,
                        todayHighlight: true
                    });
                    this.ui.weekEnd.datepicker({
                        orientation: "top right",
                        calendarWeeks: true,
                        autoclose: true,
                        todayHighlight: true
                    });

                    // Set applicable input values
                    if (this.model) {
                        this.ui.weekBegin.datepicker('update', this.model.get('Week_Begin'));
                        this.ui.weekEnd.datepicker('update', this.model.get('Week_End'));
                        this.ui.operation.val(this.model.get('Operations'));
                    }
                    else {
                        var currentDate;
                        currentDate = Backbone.Radio.request('weekly', 'current:date:range');
                        this.ui.weekBegin.datepicker('update', currentDate.get('startDate'));
                        this.ui.weekEnd.datepicker('update', currentDate.get('endDate'));
                    }
                }
            });
        }
    });

    return App.Weekly.Sales.Common.Views;
});