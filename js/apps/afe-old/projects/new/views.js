define([
    'app',
    'apps/afe/views',
    'apps/afe/projects/common/views',
    'hbs!apps/afe/projects/common/templates/itemEdit'
], function (App, AFEViews, CommonViews, itemEdit) {
    App.module('AFE.Projects.New.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Project Form
            //  ------------
            Views.Project = CommonViews.Project.extend({});

            //  Justification Amounts
            //  ---------------------
            Views.JustificationAmounts = CommonViews.Amounts.extend({
                // Configuration
                initialize: function(options) {
                    options || (options = {});
                    if (options.additionalHelpers) {
                        var helpers = _.extend((this.templateHelpers || {}), options.additionalHelpers);
                        this.templateHelpers = this.templateHelpers || {};
                    }
                    if (options.year) this.templateHelpers.year = options.year;
                },
                mapId: function(model) {
                    var res = "[data-id='" + model.get('Title') + "'] .tpl-" + model.get('Date').getFullYear();
                    return res;
                },

                // Template Helpers
                templateHelpers: {
                    showDelete: true,
                    showTotalRow: function() {
                        return true;
                    },
                    rows: function() {
                        var res = [],
                            keys = _.uniq(this.collection.pluck('Title')),
                            self = this,
                            c = _.bind(this.templateHelpers.columns, self);

                        _.each(keys, function(key) {
                            res.push({row: key, isReadOnly: false, columns: c, showDelete: true});
                        }, this);
                        return res;
                    },
                    columns: function() {
                        var res = [],
                            y = this.getOption('year') || new Date().getFullYear();

                        _.each(_.range(0,10), function(diff) {
                            var d = new Date((y + diff + 1), 0, 0);

                            res.push({
                                display: d.getFullYear(),
                                label: d.getFullYear()
                            });
                        });
                        return res;
                    }
                },

                updateTotals: function(model, stickitOptions, year, desc) {
                    if (model && (model instanceof Backbone.Model)) {
                        year = model.get('Date').getFullYear();
                        desc = model.get('Title');
                    }
                    var sum = this.collection.getTotalByYear(year),
                        sum2 = this.collection.getTotalByWhere({Title: desc});
                    if (year) this.$(("[data-id='Total'] .tpl-" + year)).text(M.Format(sum, ',', {decimal: 0}));
                    if (desc) this.$(("[data-id='" + desc + "'] .js-total")).text(M.Format(sum2, ',', {decimal: 0}));
                },

                onDomRefresh: function() {
                    _.each(_.uniq(this.collection.map(function(model) {return model.get('Date').getFullYear()})), function(year) {
                        this.updateTotals(null, null, year);
                    }, this);
                    _.each(_.uniq(this.collection.pluck('Title')), function(desc) {
                        this.updateTotals(null, null, null, desc);
                    }, this);
                }
            });

            //  Requested Amounts
            //  -----------------
            Views.RequestedAmounts = CommonViews.Amounts.extend({
                // Configuration
                initialize: function(options) {
                    options || (options = {});
                    if (options.additionalHelpers) {
                        var helpers = _.extend((this.templateHelpers || {}), options.additionalHelpers);
                        this.templateHelpers = this.templateHelpers || {};
                    }
                    if (options.year) this.templateHelpers.year = options.year;
                },
                mapId: function(model) {
                    var res = "[data-id='" + model.get('Ledger') + "'] .tpl-" + model.get('Date').getMonth();
                    return res;
                },

                // Template Helpers
                templateHelpers: {
                    showTotalRow: function() {
                        return false;
                    },
                    rows: function() {
                        var res = [],
                            keys = _.uniq(this.collection.pluck('Ledger')),
                            self = this,
                            c = _.bind(this.templateHelpers.columns, self);

                        _.each(keys, function(key) {
                            res.push({row: key, isReadOnly: (key == null ? false : true), columns: c});
                        }, this);
                        res = _.sortBy(res, function(obj) {
                            var ledger = obj.row,
                                res = 2;
                            if (ledger == 'Requested') res = 1;
                            if (ledger == 'Budget') res = 3;
                            return res;
                        });
                        return res;
                    },
                    columns: function() {
                        var res = [];
                        var y = this.getOption('year') || new Date().getFullYear();
                        _.each(_.range(1,13), function(month) {
                                var d = new Date(y, month, 0),
                                    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

                                res.push({
                                    label: d.getMonth(),
                                    display: months[d.getMonth()] + '-' + d.getFullYear().toString().substr(2,2)
                                })
                            }, this);
                        return res;
                    }
                },

                updateTotals: function(model, stickitOptions, ledger) {
                    if (model && (model instanceof Backbone.Model)) ledger = model.get('Ledger');
                    var sum = this.collection.getTotalByWhere({Ledger: ledger});
                    this.$(("[data-id='" + ledger + "'] .js-total")).text(M.Format(sum, ',', {decimal: 0}));
                },

                onDomRefresh: function() {
                    this.ui.add.remove();
                    _.each(_.uniq(this.collection.pluck('Ledger')), function(ledger) {
                        this.updateTotals(null, null, ledger);
                    }, this);
                }
            });
        }
    });

    return App.AFE.Projects.New.Views;
});