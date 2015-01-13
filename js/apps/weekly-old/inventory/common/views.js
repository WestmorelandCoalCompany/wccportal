define([
    'app',
    'hbs!apps/weekly/inventory/common/templates/form',
    'backbone.syphon'
], function (App, formTpl) {
    App.module('Weekly.Inventory.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.FormView = Marionette.ItemView.extend({
                initialize: function() {
                    this.channel = Backbone.Radio.channel('weekly');
                    this.intercom = Backbone.Radio.channel('weekly.inventory');

                    this.intercom.on('form:submit:success', function(model) {
                        this.showSuccess(model)
                    }, this);

                    this.intercom.on('form:submit:failure', function(err) {
                        this.showError(err);
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.off(null, null, this);
                    this.intercom.stopReplying(null, null, this)
                },

                // Configuration
                template: formTpl,
                tagName: 'form',
                attributes: {
                    'role': 'form'
                },

                // UI
                ui: {
                    beginningPit: 'input#inventory-beginning-pit',
                    beginningStockpile: 'input#inventory-beginning-stockpile',
                    cancel: 'button.js-cancel',
                    delete: 'button.js-delete',
                    endingInventory: 'p#inventory-ending-inventory',
                    endingStockpile: 'input#inventory-ending-stockpile',
                    endingPit: 'p#inventory-ending-pit',
                    message: '#inventory-message',
                    operation: 'select#inventory-operations',
                    pitItem: 'input.js-pit',
                    save: 'button.js-save',
                    stockpileItem: 'input.js-stockpile',
                    title: '#inventory-title',
                    tonsUncovered: 'input#inventory-tons-uncovered',
                    tonsProduced: 'input#inventory-tons-produced',
                    weekBegin: '#inventory-week-begin',
                    weekEnd: '#inventory-week-end'
                },

                // Events
                events: {
                    'click @ui.cancel': 'clickCancel',
                    'click @ui.delete': 'clickDelete',
                    'keyup @ui.beginningPit': 'updatePitInventory',
                    'keyup @ui.beginningStockpile': 'formatValue',
                    'click @ui.save': 'clickSave',
                    'keyup @ui.stockpileItem': 'updateTotalInventory',
                    'keyup @ui.tonsProduced': 'updatePitInventory',
                    'keyup @ui.tonsUncovered': 'updatePitInventory'
                },

                // Event Handlers
                clickCancel: function(e) {
                    e.preventDefault();
                    this.intercom.command('cancel');
                },

                clickDelete: function(e) {
                    e.preventDefault();
                    if (this.model) {
                        this.intercom.command('delete:entry', this.model);
                    }
                },

                clickSave: function(e) {
                    e.preventDefault();
                    e.stopPropagation();

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
                    console.log(e);
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

                updatePitInventory: function(e) {
                    var sum = 0,
                        value = 0;

                    value = this.ui.beginningPit.val();
                    if ($.type(value) === 'string') {
                        value = parseFloat(value.replace(/,/g, ''));
                    }
                    else {
                        value = parseFloat(value);
                    }
                    if (!isNaN(value)) {
                        sum += value;
                    }

                    value = this.ui.tonsUncovered.val();
                    if ($.type(value) === 'string') {
                        value = parseFloat(value.replace(/,/g, ''));
                    }
                    else {
                        value = parseFloat(value);
                    }
                    if (!isNaN(value)) {
                        sum += value;
                    }

                    value = this.ui.tonsProduced.val();
                    if ($.type(value) === 'string') {
                        value = parseFloat(value.replace(/,/g, ''));
                    }
                    else {
                        value = parseFloat(value);
                    }
                    if (!isNaN(value)) {
                        sum -= value;
                    }

                    this.ui.endingPit.text(sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    this.updateTotalInventory(e);
                },

                updateTotalInventory: function(e) {
                    var sum = parseFloat(this.ui.endingPit.text().replace(/,/g, '')),
                        value = 0;

                    value = this.ui.endingStockpile.val();
                    if ($.type(value) === 'string') {
                        value = parseFloat(value.replace(/,/g, ''));
                    }
                    else {
                        value = parseFloat(value);
                    }
                    if (!isNaN(value)) {
                        sum += value;
                    }

                    this.ui.endingInventory.text(sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
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

                    // Update calculated values
                    this.updatePitInventory(null);
                    this.updateTotalInventory(null);
                }
            });
        }
    });

    return App.Weekly.Inventory.Common.Views;
});