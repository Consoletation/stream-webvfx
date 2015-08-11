

var Common = {};

Common.BRAND_COLORS = {
    grey: '#efefef',
    red: '#ce1748',
    blue: '#14abbe',
    yellow: '#fca412'
};
Common.TRICOLOR = ['#ce1748','#14abbe','#fca412'];

Common.HASHTAG = '#rehab10';

Common.getRndInt = function(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min;
};

module.exports = Common;