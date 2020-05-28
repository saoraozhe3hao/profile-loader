const loaderUtils = require('loader-utils');

let codeIncludeExp = /\/\*include(.*?)start\*\/([\s\S]*?)\/\*include end\*\//;  // 非贪婪模式
let codeExcludeExp = /\/\*exclude(.*?)start\*\/([\s\S]*?)\/\*exclude end\*\//;
let moduleExp = /require\(.*?\?(include=|exclude=).*?\)/;
let xmlIncludeExp = /<!--include(.*?)start-->([\s\S]*?)<!--include end-->/;
let xmlExcludeExp = /<!--exclude(.*?)start-->([\s\S]*?)<!--exclude end-->/;

// 处理 /*include profile*/ <!--include profile-->
function removeNotInclude(source, profile) {
    let matchs = source.match(codeIncludeExp) || source.match(xmlIncludeExp);
    if (matchs) {
        if (!matchs[1].includes(' ' + profile + ' ')) { // include注释 里不包含当前profile，则将其删除
            source = source.replace(matchs[0], '');
        } else {
            source = source.replace(matchs[0], matchs[2]);  // 否则只去掉注释
        }
        // 一个文件里可能有多个注释，递归处理全部
        source = removeNotInclude(source, profile);
    }
    return source;
}

// 处理 /*exclude profile*/ <!--exclude profile-->
function removeIsExclude(source, profile) {
    let matchs = source.match(codeExcludeExp) || source.match(xmlExcludeExp);
    if (matchs) {
        if (matchs[1].includes(' ' + profile + ' ')) { // include注释 里不包含当前profile，则将其删除
            source = source.replace(matchs[0], '');
        } else {
            source = source.replace(matchs[0], matchs[2]);  // 否则只去掉注释
        }
        // 一个文件里可能有多个注释，递归处理全部
        source = removeIsExclude(source, profile);
    }
    return source;
}

// 处理 import "module?include=xx&exclude=xx"
function removeModule(source, profile) {
    let matchs = source.match(moduleExp);   // import './mock?include=local&exclude=prod' 会被转成 require("./mock?include=local&exclude=prod")
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
        // 一个文件里可能有多条，递归处理全部
        source = removeModule(source, profile);
    }
    return source;
}

module.exports = function (source) {
    const options = loaderUtils.getOptions(this);
    let profile = options.profile || "";

    source = removeNotInclude(source, profile);

    source = removeIsExclude(source, profile);

    source = removeModule(source, profile);

    return source;
};