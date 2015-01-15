/*
 *  name: models
 *  path: apps/afe/entities/projects/models
 *  desc: SharePoint AFE projects
 */

define([
    'backbone',
    'backbone.backgrid',
    'backbone.sp'
], function (Backbone, Backgrid) {
    var Models = {};

    //  Entity Definitions
    //  ------------------

    // Project model
    Models.Project = Backbone.SP.Item.extend({
        site: '/',
        list: 'Capital Projects',

        defaults: {
            Submitted: false,
            __metadata: {
                type: "SP.Data.Capital_x0020_ProjectsListItem"
            }
        },

        parse: function(res, options) {
            if (options.deleted || options.updated) {
                return this.attributes;
            }
            if (res.Notes) res.Notes = $(res.Notes).text();
            return res;
        }
    });

    // Project collection
    Models.Projects = Backbone.SP.List.extend({
        initialize: function(models, options) {
            options || (options = {});
            if (options.currentUser) this.currentUser = options.currentUser;
        },
        model: Models.Project,
        fetch: function (options) {
            options || (options = {});
            $.extend(options, {
                select: '*'
            });
            Backbone.Collection.prototype.fetch.call(this, options);
        }
    });

    //  Column Definitions
    //  ------------------

    // Columns
    Models.Columns = [
        {
            name: 'Work_x0020_Order_x0020_Number',
            label: 'Work Order',
            editable: false,
            cell: 'string'
        },
        {
            name: 'Work_x0020_Order_x0020_Desc',
            label: 'Project',
            editable: false,
            cell: 'string'
        },
        {
            name: 'Operation',
            label: 'Operation',
            editable: false,
            cell: 'string'
        },
        {
            name: 'Notes',
            label: 'Description',
            editable: false,
            cell: Backgrid.StringCell.extend({
                formatter: Backgrid.CellFormatter.extend({
                    fromRaw: function(raw, model) {
                        return raw.substr(0,30) + '...'
                    }
                })
            })
        }
    ];

    return Models;
});