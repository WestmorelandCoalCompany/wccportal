define('apps/utils/templates/helpers/formatCommas', [
    'hbs/handlebars'
], function (Handlebars) {
    // formatCommas
    Handlebars.registerHelper('formatCommas', function(num) {
        num || (num = 0);
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });
});