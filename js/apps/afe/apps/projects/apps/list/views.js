/*
 *  name: views
 *  path: apps/afe/apps/projects/views
 *  desc: Project sub application views
 */

define([
    'marionette',
    'backbone.backgrid',
    'hbs!apps/afe/apps/projects/apps/list/templates/layout'
], function (Marionette, Backgrid, LayoutTpl) {
    var Views = {};

    //  Layout View
    //  -----------

    Views.LayoutView = Marionette.LayoutView.extend({
        // Configuration
        template: LayoutTpl,
        className: 'col-sm-12',
        regions: {
            contentRegion: '#afe-project-list'
        },

        // UI
        ui: {
            yearDisplay: '#afe-list-year',
            yearMenu: '#afe-list-year-menu',
            year: '#afe-list-year-menu a'
        },

        // Events
        events: {
            'click @ui.year': 'changeYear'
        },

        // Event handlers

        // Update the year menu, notify the app if changed
        changeYear: function(e) {
            e.preventDefault();
            var selected = $(e.target).text(),
                current = this.ui.yearDisplay.text();

            if (selected != current) {
                this.ui.yearDisplay.text(selected);
                this.trigger('changed:year', selected);
            }
        },

        // Return the currently selected year
        onGetYear: function() {
            return this.ui.yearDisplay.text();
        },

        // Internal Methods
        onRender: function() {
            // Build the year menu with correct years
            var start = 2014,
                years = [start];
            for (var i = (start + 1); i <= new Date().getFullYear(); i++) {
                years.push(i);
            }

            _.each(years, function(year) {
                this.ui.yearMenu.append('<li><a href="#">' + year + '</a></li>')
            }, this);

            this.ui.yearDisplay.text(new Date().getFullYear());
        }
    });



    //  Grid View
    //  ---------

    Views.GridView = Marionette.ItemView.extend({
        className: 'col-sm-12',
        initialize: function() {
            this.grid = new Backgrid.Grid({
                columns: this.columns,
                collection: this.collection
            });
        },
        render: function() {
            this.$el.html(this.grid.render().el);
        }
    });

    return Views;
});