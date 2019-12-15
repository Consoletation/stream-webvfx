

var Common = {};

Common.BRAND_COLORS = {
    grey: '#efefef',
    red: '#ce1748',
    blue: '#14abbe',
    yellow: '#fca412'
};
Common.TRICOLOR = ['#ce1748','#14abbe','#fca412'];
Common.TRICOLOR_RGB = [
    [206,23,72],
    [20,171,190],
    [252,164,18]
];
Common.R_360 = 6.28318531;
Common.HASHTAG = '#consoletation';

Common.getRndInt = function(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min;
};

module.exports = Common;
