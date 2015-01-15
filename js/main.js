requirejs.config({
    'baseUrl': 'http://wccportal-test/SiteAssets/js',
    'paths': {
        // Backbone & plugins
        'backbone': 'libs/backbone/backbone',
        'backbone.backgrid': 'libs/backbone/plugins/backgrid/backgrid',
        'backbone.grouped': 'libs/backbone/plugins/entities/backbone.grouped-collection',
        'backbone.paginator': 'libs/backbone/plugins/paginator/backbone.paginator.min',
        'backbone.picky': 'libs/backbone/plugins/entities/backbone.picky.min',
        'backbone.picky.models': 'apps/utils/backbone.picky.models',
        'backbone.radio': 'libs/backbone/plugins/radio/backbone.radio',
        'backbone.radio.shim': 'libs/backbone/plugins/radio/backbone.radio.shim',
        'backbone.relational': 'libs/backbone/plugins/entities/backbone.relational',
        'backbone.sp': 'libs/backbone/plugins/sharepoint/backbone-sharepoint.odata',
        'backbone.stickit': 'libs/backbone/plugins/stickit/backbone.stickit',
        'backbone.super': 'libs/backbone/plugins/other/backbone-super',
        'backbone.syphon': 'libs/backbone/plugins/syphon/backbone.syphon.min',
        'backbone.validation': 'libs/backbone/plugins/validation/backbone-validation-amd-min',
        'backbone.vc': 'libs/backbone/plugins/entities/backbone.virtual-collection',

        // Bootstrap
        'bootstrap': 'libs/bootstrap/bootstrap.min',
        'bootstrap.datepicker': 'libs/bootstrap/plugins/bootstrap.datepicker',
        'sprockets': 'libs/bootstrap/javascripts/bootstrap-sprockets',

        // Data Visualization
        'd3': 'libs/d3/d3',
        'leaflet': 'libs/leaflet/leaflet-src',
        'omnivore': 'libs/leaflet/plugins/leaflet-omnivore.min',
        'topojson': 'libs/topojson/topojson',

        // Jquery
        'jquery': 'libs/jquery/jquery',
        'jquery.ui.slide': 'libs/jquery/plugins/ui/slide',

        // Libraries & Frameworks
        'async': 'libs/async/async',
        'underscore': 'libs/underscore/underscore.min',
        'prototype': 'libs/prototype/prototype',

        // Marionette & Plugins
        'marionette': 'libs/backbone/plugins/marionette/backbone.marionette-src',
        'marionette.m': 'utils/m/backbone.marionette.m',
        'marionette.subrouter': 'libs/backbone/plugins/marionette/plugins/subrouter/backbone.marionette.subrouter',

        // Sharepoint
        'SP': '../../_layouts/15/sp',
        'SP.runtime': '../../_layouts/15/sp.Runtime',
        'SP.taxonomy': '../../_layouts/15/sp.Taxonomy',
        'SP.userprofiles': '../../_layouts/15/sp.UserProfiles',

        // Templating
        'hbs': 'libs/require-handlebars-plugin/hbs',
        'text': 'libs/require/text',
        'tpl': 'libs/underscore/plugins/tpl',

        // Other
        'spin': 'libs/spin/spin'
    },
    'shim': {
        'backbone': {
            exports: 'Backbone',
            deps: ['jquery', 'underscore']
        },
        'backbone.backgrid': ['backbone'],
        'backbone.grouped': ['backbone', 'backbone.vc'],
        'backbone.paginator': ['backbone'],
        'backbone.radio': ['backbone'],
        'backbone.radio.shim': ['backbone', 'backbone.radio'],
        'backbone.relational': ['underscore', 'backbone'],
        'backbone.syphon': ['backbone'],
        'backbone.validation': ['backbone'],
        'backbone.vc': ['backbone'],
        'bootstrap': ['jquery'],
        'bootstrap.datepicker': ['bootstrap'],
        'jquery': {
            exports: '$'
        },
        'jquery.ui.slide': ['jquery'],
        'marionette': {
            exports: 'Marionette',
            deps: ['backbone']
        },
        'marionette.m': {
            exports: 'M',
            deps: ['underscore', 'backbone', 'marionette', 'marionette.subrouter', 'backbone.radio.shim']
        },
        'marionette.subrouter': ['backbone', 'underscore', 'marionette'],
        'machine': {
            exports: 'Machine',
            deps: ['underscore', 'backbone', 'marionette', 'backbone.radio.shim']
        },
        'omnivore': 'leaflet',
        'prototype': {
        	exports: 'Prototype'
        },
        'SP': ['SP.runtime'],
        'SP.runtime': {
            exports: 'SP'
        },
        'SP.taxonomy': ['SP.runtime', 'SP'],
        'SP.userprofiles': ['SP'],
        'sprockets': ['jquery', 'bootstrap'],
        'topojson': ['d3'],
        'tpl': ['text'],
        'underscore': {
            exports: '_'
        }
    },
    'map': {
        '*': {
            'backbone.wreqr': 'backbone.radio',
            'backbone.marionette': 'marionette'
        }
    }
});

require(['app'], function (App) {
    $(document).ready(function () {
        App.start();
    });
});

