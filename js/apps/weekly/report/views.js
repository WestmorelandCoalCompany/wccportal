define([
    'app',
    'apps/weekly/report/regions',
    'hbs!apps/weekly/report/templates/layout',
    'hbs!apps/weekly/report/templates/entry',
    'hbs!apps/weekly/report/templates/empty',
    'backbone.stickit'
], function (App, Regions, LayoutTpl, EntryTpl, EmptyTpl) {
    App.module('Weekly.Report.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Report SubLayout
            //  ----------------

            Views.LayoutView = Marionette.LayoutView.extend({
                // delete
                onDestroy: function() {
                    console.log('Report layout has been destroyed');
                },

                //  Configuration
                template: LayoutTpl,
                className: 'col-sm-12',
                regions: {
                    contentRegion: {
                        selector: '#weekly-report-content',
                        regionClass: Regions.SlideRegion
                    }
                },

                //  UI
                ui: {
                    active: '#js-current-op',
                    next: 'a.js-next-op',
                    prev: 'a.js-previous-op',
                    print: 'button.js-print'
                },

                //  Events
                triggers: {
                    'click @ui.next': 'next',
                    'click @ui.prev': 'previous'
                },

                events: {
                    'click @ui.print': 'printReport'
                },

                //  Event Handlers
                onUpdateTitle: function(operation) {
                    this.ui.active.text(operation);
                },

                printReport: function() {
                    window.print();
                }
            });

            Views.Report = Marionette.ItemView.extend({
                // Configuration
                template:EntryTpl,
                tagName: 'div',
                className: 'col-sm-12',

                // Template Helpers
                templateHelpers: {
                    endingPit: function() {
                        if (!this.model) return '';
                        var a = this.model.get('Beg_Pit_Inv'),
                            b = this.model.get('Tons_Uncovered'),
                            c = this.model.get('Tons_Produced');
                        return M.Format((a + b - c), ',', {decimal: 0});
                    },
                    totalInv: function() {
                        if (!this.model) return '';
                        var a = this.model.get('Beg_Pit_Inv'),
                            b = this.model.get('Tons_Uncovered'),
                            c = this.model.get('Tons_Produced'),
                            d = this.model.get('End_Stockpile_Inv')
                        return M.Format((a + b - c + d), ',', {decimal: 0});
                    }
                },

                // Bindings
                bindings: {
                    // Safety
                    '#msha-weekly-hourly': {observe: 'MSHA_Weekly_Hourly', onGet: 'numToText', onSet: 'textToNum'},
                    '#msha-ytd-hourly': {observe: 'MSHA_YTD_Hourly', onGet: 'numToText', onSet: 'textToNum'},
                    '#lti-ytd-hourly': {observe: 'LTI_YTD_Hourly', onGet: 'numToText', onSet: 'textToNum'},
                    '#msha-weekly-salaried': {observe: 'MSHA_Weekly_Salaried', onGet: 'numToText', onSet: 'textToNum'},
                    '#msha-ytd-salaried': {observe: 'MSHA_YTD_Salaried', onGet: 'numToText', onSet: 'textToNum'},
                    '#lti-ytd-salaried': {observe: 'LTI_YTD_Salaried', onGet: 'numToText', onSet: 'textToNum'},
                    '#msha-weekly-contractor': {observe: 'MSHA_Weekly_Contractor', onGet: 'numToText', onSet: 'textToNum'},
                    '#msha-ytd-contractor': {observe: 'MSHA_YTD_Contractor', onGet: 'numToText', onSet: 'textToNum'},
                    '#lti-ytd-contractor': {observe: 'LTI_YTD_Contractor', onGet: 'numToText', onSet: 'textToNum'},
                    '#dsl-msha': {observe: 'MSHA_Days_Since_Last', onGet: 'numToText', onSet: 'textToNum'},
                    '#dsl-lti': {observe: 'LTI_Days_Since_Last', onGet: 'numToText', onSet: 'textToNum'},

                    // Sales
                    '#sales-weekly-actual': {observe: 'Sales_Weekly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-weekly-forecast': {observe: 'Sales_Weekly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-weekly-budget': {observe: 'Sales_Weekly_Budget', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-monthly-actual': {observe: 'Sales_Monthly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-monthly-forecast': {observe: 'Sales_Monthly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-monthly-budget': {observe: 'Sales_Monthly_Budget', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-ytd-actual': {observe: 'Sales_YTD_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-ytd-forecast': {observe: 'Sales_YTD_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#sales-ytd-budget': {observe: 'Sales_YTD_Budget', onGet: 'numToText', onSet: 'textToNum'},

                    // Production
                    '#Draglines_Weekly_Actual': {observe: 'Draglines_Weekly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Draglines_Weekly_Forecast': {observe: 'Draglines_Weekly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Draglines_Monthly_Actual': {observe: 'Draglines_Monthly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Draglines_Monthly_Forecast': {observe: 'Draglines_Monthly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Weekly_Actual': {observe: 'Mobile_Weekly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Weekly_Forecast': {observe: 'Mobile_Weekly_Forecast', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Monthly_Actual': {observe: 'Mobile_Monthly_Actual', onGet: 'numToText', onSet: 'textToNum'},
                    '#Mobile_Monthly_Forecast': {observe: 'Mobile_Monthly_Forecast', onGet: 'numToText', onSet: 'textToNum'},

                    // Inventory
                    '#beginning-pit': {observe: 'Beg_Pit_Inv', onGet: 'numToText', onSet: 'textToNum'},
                    '#tons-uncovered': {observe: 'Tons_Uncovered', onGet: 'numToText', onSet: 'textToNum'},
                    '#tons-produced': {observe: 'Tons_Produced', onGet: 'numToText', onSet: 'textToNum'},
                    '#beginning-stockpile': {observe: 'Beg_Stockpile_Inv', onGet: 'numToText', onSet: 'textToNum'},
                    '#ending-stockpile': {observe: 'End_Stockpile_Inv', onGet: 'numToText', onSet: 'textToNum'}
                },

                // Events
                collectionEvents: {
                    'reset': 'render'
                },

                // Formatters
                textToNum: function(val, options) {
                    return parseFloat(val.replace(/[^0-9\.]+/g, ''));
                },

                numToText: function(val, options) {
                    return M.Format(val, ',', {decimal: 0})
                },

                render: function() {
                    Marionette.ItemView.prototype.render.call(this);
                    if (this.model) this.stickit();
                }
            });

            Views.Empty = Marionette.ItemView.extend({
                template: EmptyTpl,
                tagName: 'div',
                className: 'col-sm-12'
            });
        }
    });

    return App.Weekly.Report.Views;
});