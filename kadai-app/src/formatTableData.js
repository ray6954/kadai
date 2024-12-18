import { grouping } from './grouping';

/**
 * ソート、都県を列に持ちかえる
 * @param {*} jsonData 
 * @param {*} csvData 
 * @returns 
 */
export const formatTableData = (jsonData, csvData) => {
    console.log("formatData");

    let groupInfo = grouping(csvData);

    let classObj = jsonData.GET_STATS_DATA.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ;
    let areaDict = {};
    let timeDict = {};
    for (const item of classObj) {
      if ('area' === item['@id']) {
        // エリアマスタを首都圏に絞って取得
        // CLASS : {
        // {"@code": "00000","@name": "全国","@level": "1"},
        // {"@code": "01000","@name": "北海道","@level": "2"},,,
        let areaList = item['CLASS'];
        for (const group of groupInfo) {
          for (const area of areaList) {
            if (group.name === area["@name"]) {
              areaDict[area["@code"]] = group;
              break;
            }
          }
        }
      }
      if ('time' === item['@id']) {
        // 調査年
        // CLASS : {
        // {"@code": "1995100000","@name": "1995年度", "@level": "1"},
        let timeList = item['CLASS'];
        for (const time of timeList) {
          timeDict[time["@code"]] = time["@name"];
        }
      }
    }

    // {"@tab": "00001","@cat01": "#A011000","@area": "00000","@time": "1995100000","@unit": "万人","$": "12557"},
    // {"@tab": "00001","@cat01": "#A011000","@area": "00000","@time": "1996100000","@unit": "万人","$": "12586"},,
    let dataValues = jsonData.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;
    // 横軸：都県、縦軸：年代（降順）
    let tempRows = [];
    let rows = [];
    for (const data of dataValues) {
      if (areaDict[data["@area"]]) {
        // 首都圏のみ取得
        tempRows.push({
          ...data,
          ...{ areaInfo: areaDict[data["@area"]] }
        }
        );
        rows.push({ name: data["@area"], age: data["@time"], city: data["$"] });
      }
    }

    tempRows.sort(function (a, b) {
      // 年代の降順
      if (a["@time"] > b["@time"]) {
        return -1;
      } else if (a["@time"] < b["@time"]) {
        return 1;
      } else { 
        if (a.areaInfo.order > b.areaInfo.order) {
          return 1;
        } else {
          return -1;
        }
        // 都県をグループごとに並べる場合
        // if (a.areaInfo.group > b.areaInfo.group) {
        //   return 1;
        // } else if (a.areaInfo.group < b.areaInfo.group) {
        //   return -1;
        // } else {
        //   if(a.areaInfo.order > b.areaInfo.order) {
        //     return 1
        //   } else {
        //     return -1;
        //   }
        // }
      }
    });

    // 都県を横並びにする
    let tableRows = [];
    let exTime = '';
    let row = {};
    for (const data of tempRows) {
      let curTime = data["@time"];

      if (exTime !== curTime) {
        if (exTime !== '') {
          tableRows.push(row);
        }
        row = { time: curTime, timeDisp: timeDict[data["@time"]], areaData: [] }
      }
      row.areaData.push(data);
      exTime = curTime;
    }
    tableRows.push(row);

    // estatData
    return tableRows;
  };