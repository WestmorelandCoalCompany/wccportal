/**
 * Created by cludden on 11/21/2014.
 */
define([
    'app',
    'hbs!apps/weekly/mainMenu/templates/item',
    'hbs!apps/weekly/mainMenu/templates/dropdown'
], function(App, itemTpl, dropdownTpl) {
   App.module('Weekly.MainMenu.Views', {
       define: function(Views, App, Backbone, Marionette, $, _) {
           Views.MenuItemView = Marionette.ItemView.extend({
               initialize: function() {
                   this.channel = Backbone.Radio.channel('weekly.mainmenu');
               },

               // Configuration
               getTemplate: function() {
                   if (this.model.get('items')) {
                       return dropdownTpl;
                   }
                   else {
                       return itemTpl;
                   }
               },
               tagName: 'li',
               className: function() {
                   if (this.model.get('items')) {
                       return 'dropdown';
                   }
               },

               ui: {
                   select: 'a.js-select'
               },

               // Events
               events: {
                   'click @ui.select': 'select'
               },

               select: function(e) {
                   e.preventDefault();
                   this.channel.command('navigate', this.model);
               },

               // Internal
               onRender: function() {
                   if (this.model.selected) {
                       this.$el.addClass('active');
                   }
               }
           });

           Views.MenuView = Marionette.CollectionView.extend({
               childView: Views.MenuItemView,
               tagName: 'ul',
               className: 'nav navbar-nav',

               // Events
               collectionEvents: {
                   'selected': 'render'
               }
           });
       }
   });

    return App.Weekly.MainMenu.Views;
});