define('apps/utils/templates/helpers/dollarize', [
    'hbs/handlebars'
], function (Handlebars) {
    Handlebars.registerHelper ('dollarize', function (n, decimals, dollarSign, divisor) {
        decimals || (decimals = 2);
        dollarSign = dollarSign ? dollarSign : false;
        divisor || (divisor = 1);
        var res = '';

        n = (n/divisor);
        if (dollarSign) res += '$';
        n = n.toFixed(decimals).replace(/./g, function(c, i, a) {
            return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
        });
        res += n;
        return res;
    });
});