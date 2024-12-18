/**
 * API問い合わせ
 * @param {*} from 
 * @param {*} to 
 * @returns 
 */
export function callEstat(from, to) {
    console.log("callEstat");
    const baseUrl = 'http://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?';
    const p = {
        appId: "9a4278dc6ce2ff0f4105fe03b9233b33ec5686ad",
        lang: "J",
        statsDataId: "0000010201",
        metaGetFlg: "Y",
        cntGetFlg: "N",
        explanationGetFlg: "Y",
        annotationGetFlg: "Y",
        sectionHeaderFlg: 1,
        replaceSpChars: 0,
        cdCat01: "#A011000"
    }
    
    const params = new URLSearchParams(p).toString();
    const estatApiUrl = new URL(baseUrl + params);
    if(!(!from)) {
        estatApiUrl.searchParams.append('cdTimeFrom', from);
    }
    if(!(!to)) {
        estatApiUrl.searchParams.append('cdTimeTo', to);
    }

    return fetch(estatApiUrl.toString(), { method: 'GET' })
        .then(response => response.json())
        .catch(error => console.log(error));
}