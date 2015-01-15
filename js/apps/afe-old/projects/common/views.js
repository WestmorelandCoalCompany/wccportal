define([
    'app',
    'hbs!apps/afe/projects/common/templates/formLayout',
    'hbs!apps/afe/projects/common/templates/projectForm',
    'hbs!apps/afe/projects/common/templates/amount',
    'hbs!apps/afe/projects/common/templates/itemEdit',
    'hbs!apps/afe/projects/common/templates/itemReadOnly',
    'hbs!apps/afe/projects/common/templates/summary',
    'backbone.syphon',
    'backbone.stickit'
], function (App, formLayoutTpl, projectFormTpl, amountTpl, itemTpl, itemROTpl, summaryTpl) {
    App.module('AFE.Projects.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Views.Layout
            //  ------------
            Views.Layout = Marionette.LayoutView.extend({
                // Configuration
                template: formLayoutTpl,
                tagName: 'div',
                className: 'col-md-12',
                regions: {
                    messageRegion: '#afe-message',
                    projectRegion: '#afe-project',
                    requestedRegion: '#afe-requested',
                    justificationRegion: '#afe-justification',
                    summaryRegion: '#afe-summary'
                },

                // UI
                ui: {
                    back: 'button.js-back',
                    delete: 'button.js-delete',
                    message: '#afe-message',
                    save: 'button.js-save',
                    submit: 'button.js-submit'
                },

                // Events
                triggers: {
                    'click @ui.back': 'back',
                    'click @ui.delete': 'delete',
                    'click @ui.save': 'save',
                    'click @ui.submit': 'submit'
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
                }
            });

            //  Views.Project
            //  -------------
            Views.Project = Marionette.ItemView.extend({
                // Configuration
                template: projectFormTpl,
                tagName: 'div',
                className: 'col-sm-12',
                initialize: function(options) {
                    options || (options = {});
                    if (options.additionalHelpers) {
                        var helpers = _.extend((this.templateHelpers || {}), options.additionalHelpers);
                        this.templateHelpers = this.templateHelpers || {};
                    }
                    if (options.operations) this.templateHelpers.operationsList = options.operations;
                    if (options.ledgers) this.templateHelpers.ledgersList = options.ledgers;
                },

                // Template Helpers
                templateHelpers: {
                    operationsList: [],
                    ledgersList: [],
                    yearsList: function() {
                        var today = new Date(),
                            thisYear = today.getFullYear(),
                            nextYear = today.getMonth() >= 9 ? thisYear + 1 : null,
                            res = [{year: thisYear}];
                        if (nextYear) {
                            res.push({year: nextYear});
                        }
                        return res;
                    }
                },

                // UI
                ui: {
                    ledger: '#afe-ledger',
                    operation: '#afe-operation',
                    wo: '#afe-wo',
                    year: '#afe-year'
                },

                // Bindings
                bindings: {
                    '#afe-operation': {
                        observe: 'Operation',
                        selectOptions: {
                            collection: function() {
                                return this.templateHelpers.operationsList
                            },
                            labelPath: 'Title',
                            valuePath: 'Title'
                        }
                    },
                    '#afe-wo': {
                        observe: ['Work_x0020_Order_x0020_Number', 'Work_x0020_Order_x0020_Desc'],
                        getVal: function($el, e, options) {
                            return $el.val();
                        },
                        onGet: function(values) {
                            return values.join(': ');
                        },
                        onSet: function(val) {
                            return val.split(': ');
                        }
                    },
                    '#afe-useful-life': {
                        observe: 'Useful_x0020_Life',
                        updateModel: 'validateNumber'
                    },
                    '#afe-notes': {
                        observe: 'Notes',
                        escape: true
                    }
                },

                // Events
                events: {
                    'change @ui.operation': 'validateOp',
                    'change @ui.ledger': 'validateLedger',
                    'change @ui.year': 'validateYear',
                    'change @ui.wo': 'validateWO'
                },

                // Event Handlers
                onSave: function() {
                    var data = Backbone.Syphon.serialize(this),
                        wostring = this.ui.wo.val().split(': '),
                        num = wostring[0],
                        desc = wostring[1];

                    data = _.extend(data, {
                        'Work_x0020_Order_x0020_Number': num,
                        'Work_x0020_Order_x0020_Desc': desc,
                        'Title': desc,
                        'Submitted': false
                    });

                    if (data.Submitted) data.Submitted = parseInt(data.Submitted);

                    return data;
                },

                onGetYear: function() {
                    return parseInt(this.ui.year.val())
                },

                validateOp: function(e) {
                    var ok = this.ui.operation.val() != 'Select an Operation';
                    if (ok) {
                        this.ui.ledger.removeAttr('disabled');
                        this.validateLedger(e);
                    }
                    else {
                        _.each(['ledger', 'year', 'wo'], function(uiName) {
                            this.ui[uiName].attr('disabled', 'disabled');
                            this.ui[uiName].val(this.ui[uiName].find('option:first').val());
                        }, this);
                    }
                },

                validateLedger: function(e) {
                    var defaultVal = 'Select a Ledger',
                        ok = this.ui.ledger.val() != defaultVal;
                    if (ok) {
                        this.ui.year.removeAttr('disabled');
                        this.validateYear(e);
                    }
                    else {
                        _.each(['year', 'wo'], function(uiName) {
                            this.ui[uiName].attr('disabled', 'disabled');
                            this.ui[uiName].val(this.ui[uiName].find('option:first').val());
                        }, this);
                    }
                },

                validateYear: function(e) {
                    var ok = this.ui.year.val() != 'Select a Year';
                    if (ok) {
                        $('body').css('cursor', 'progress');
                        var year = parseInt(this.ui.year.val());
                        var args = {
                            year: year,
                            update: true,
                            data: {
                                operation: this.ui.operation.val(),
                                ledger: this.ui.ledger.val(),
                                year: year
                            }
                        };
                        var wo_xhr = Backbone.Radio.request('afe:api', 'work:orders', args);
                        $.when(wo_xhr).then(
                            $.proxy(function(workOrders) {
                                // reset the box
                                var defaultOption = '<option selected="true">Select a Work Order</option>';
                                this.ui.wo.empty();
                                if (workOrders.length != 0) {
                                    this.ui.wo.append(defaultOption);
                                    workOrders.each(
                                        $.proxy(function (order) {
                                            var option = '<option>' + order.get('Work_Order') + ': ' +
                                                order.get('Work_Order_Desc') + '</option>';
                                            this.ui.wo.append(option);
                                        }, this)
                                    );
                                    this.ui.wo.removeAttr('disabled');
                                }
                                else {
                                    var option = '<option selected="true">No work orders found.</option>';
                                    this.ui.wo.append(option);
                                }
                                $('body').css('cursor', 'default');
                                this.validateWO(e);
                            }, this)
                        );
                    }
                    else {
                        this.ui.wo.attr('disabled', 'disabled');
                        this.ui.wo.empty();
                        this.ui.wo.html('<option selected="true">Select a Work Order</option>');
                    }
                },

                validateWO: function(e) {
                    var val = this.ui.wo.val();
                    var ok = val != 'Select a Work Order' && val != 'No work orders found.';
                    if (ok) {
                        var year = parseInt(this.ui.year.val()),
                            args = {
                            update: true,
                            year: year,
                            data: {
                                operation: this.ui.operation.val(),
                                ledger: this.ui.ledger.val(),
                                year: year,
                                workOrder: parseInt(this.ui.wo.val())
                            }
                        };
                        this.trigger('show:amounts', args);
                    }
                    else {
                        this.trigger('clear:amounts');
                    }
                },

                // Stickit Validators
                validateNumber: function(val, event, options) {
                    return !isNaN(parseFloat(val));
                },

                // Internal Methods
                render: function() {
                    Marionette.ItemView.prototype.render.call(this);
                    this.stickit();
                },

                onDomRefresh: function() {
                    if (this.model.isNew()) {
                        $('#afe-project-delete').remove();
                    }
                }
            });

            //  Views.AmountItem
            //  ----------------
            Views.Amount = Marionette.ItemView.extend({
                getTemplate: function() {
                    if (this.model.get('Ledger') == 'Requested' || this.model.get('Amount_Type') == 'Justification') {
                        return itemTpl;
                    }
                    return itemROTpl;
                },
                tagName: 'p',
                templateHelpers: {
                    isReadOnly: function() {

                    },
                    isZero: function() {
                        if (this.model.get('Amount') == 0) return 'text-muted';
                        return '';
                    }
                },

                bindings: {
                    '.js-amount': {
                        observe: 'Amount',
                        onGet: 'addCommas',
                        onSet: 'stripCommas'
                    },
                    '.js-amount-desc': {
                        observe: 'Title'
                    }
                },

                addCommas: function(n) {
                    if (!n) return void 0;
                    return M.Format(n, ',', {decimal: 0});
                },

                stripCommas: function(val) {
                    if (val === undefined) {
                        return 0
                    }
                    else {
                        if ($.type(val) == 'number') {
                            return val;
                        }
                        else if ($.type(val) == 'string') {
                            var r = parseFloat(val.replace(/[^\d.-]/g, ''));
                            if (!isNaN(r)) return r;
                        }
                        return 0;
                    }
                },

                render: function() {
                    Marionette.ItemView.prototype.render.call(this);
                    this.stickit();
                }
            });

            //  Views.Amount
            //  ------------
            Views.Amounts = M.ModelMapView.extend({
                // Configuration
                template: amountTpl,
                childView: Views.Amount,

                // UI
                ui: {
                    add: 'button.js-add',
                    delete: 'button.js-delete',
                    desc: 'input.js-desc'
                },

                // Events
                triggers: {
                    'click @ui.add': 'add:row'
                },

                events: {
                    'click @ui.delete': 'clickDelete',
                    'change @ui.desc': 'changeDesc'
                },

                collectionEvents: {
                    'change': 'updateTotals',
                    'add': 'render',
                    'remove': 'render'
                },

                changeDesc: function(e) {
                    var row = $(e.target).closest('tr'),
                        from = row.attr('data-id'),
                        to = e.target.value;
                    this.trigger('change:desc', from, to);
                    row.attr('data-id',to);
                },

                clickDelete: function(e) {
                    this.trigger('delete:row', e.target.getAttribute('data-id'));
                }
            });

            //  Views.Summary
            //  -------------
            Views.Summary = Marionette.ItemView.extend({
                template: summaryTpl,
                tagName: 'div',

                bindings: {
                    '#afe-irr': {
                        observe: 'irr',
                        onGet: function(value) {
                            return M.Format(value, '%', {divisor: (1/100)});
                        }
                    },
                    '#afe-npv': {
                        observe: 'npv',
                        onGet: function(value) {
                            return M.Format(value, '$', { decimal: 0 });
                        }
                    },
                    '#afe-pbp': {
                        observe: 'pbp',
                        onGet: function(value) {
                            return M.Format(value, ',');
                        }
                    }
                },

                ui: {
                    calc: 'button.js-calc'
                },

                triggers: {
                    'click @ui.calc': 'recalculate'
                },

                render: function() {
                    Marionette.ItemView.prototype.render.call(this);
                    this.stickit();
                }
            })

        }
    });

    return App.AFE.Projects.Common.Views;
});