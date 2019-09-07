const loaderUtils = require('loader-utils');

let includeRegExp = new RegExp("\\/\\*include(.*)start\\*\\/[\\s\\S]*\\/\\*include(.*)end\\*\\/");
let excludeRegExp = new RegExp("\\/\\*exclude(.*)start\\*\\/[\\s\\S]*\\/\\*exclude(.*)end\\*\\/");

module.exports = function (source, option) {
    const options = loaderUtils.getOptions(this);
    let profile = options.profile || "";

    let matchs = source.match(includeRegExp, '');
    if (matchs && !matchs[1].includes(' ' + profile + ' ')) {  // include 里不包含当前profile，则将其删除
        source = source.replace(matchs[0], '');
    }

    matchs = source.match(excludeRegExp, '');
    if (matchs && matchs[1].includes(' ' + profile + ' ')) {  // exclude 里包含当前profile，则将其删除
        source = source.replace(matchs[0], '');
    }
    return source;
};
