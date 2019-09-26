const loaderUtils = require('loader-utils');

let includeNoteExp = new RegExp("\\/\\*include(.*)start\\*\\/[\\s\\S]*\\/\\*include end\\*\\/");
let excludeNodeExp = new RegExp("\\/\\*exclude(.*)start\\*\\/[\\s\\S]*\\/\\*exclude end\\*\\/");
let moduleExp = new RegExp("require\\(\"\\.\\/.*\\?(.*)\"\\)");

module.exports = function (source, option) {
    const options = loaderUtils.getOptions(this);
    let profile = options.profile || "";

    let matchs = source.match(includeNoteExp);
    if (matchs && !matchs[1].includes(' ' + profile + ' ')) {  // include注释 里不包含当前profile，则将其删除
        source = source.replace(matchs[0], '');
    }

    matchs = source.match(excludeNodeExp);
    if (matchs && matchs[1].includes(' ' + profile + ' ')) {  // exclude注释 里包含当前profile，则将其删除
        source = source.replace(matchs[0], '');
    }

    matchs = source.match(moduleExp);   // import './mock?include=local&exclude=prod' 会被转成 require("./mock?include=local&exclude=prod")
    if (matchs) {
        let segments = matchs[1].split('&');
        segments.forEach((item) => {
            if (item.includes('include=') && !item.includes(profile)) {  // include= 不包含当前profile，则将其删除
                source = source.replace(matchs[0], '');
            }
            if (item.includes('exclude=') && item.includes(profile)) { // exclude= 包含当前profile，则将其删除
                source = source.replace(matchs[0], '');
            }
        });
    }
    return source;
};