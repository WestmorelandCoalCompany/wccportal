define([
    'app',
    'SP.userprofiles',
    'backbone.sp'
], function (App) {
    App.module('Main.User.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            Models.User = Backbone.SP.Item.extend({
                url: function() {
                    var userid= _spPageContextInfo.userId;
                    var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
                    var test = 'http://wccportal-test/_api/SP.UserProfiles.PeopleManager/GetMyProperties';
                    return requestUri;
                },
                getLocation: function() {
                    var url = "http://wccportal-test/_api/SP.UserProfiles.PeopleManager/" +
                        "GetUserProfilePropertyFor(accountName=@v,propertyName='Office')" +
                        "?@v='" + this.get('')
                }
            })
        }
    });

    return App.Main.User.Models;
});