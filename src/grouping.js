export function grouping(csvArr) {
    console.log("grouping");

    if (!csvArr) {
        return [];
    }

    // ヘッダ行から都県名を取得する
    let areas = [];
    let idxArr = []
    let header = csvArr[0];
    // header[0]は[X]なので1オリジン
    let index = 0;
    for (let i = 1; i < header.length; i++) {
        let area = { name: header[i], group: 0, order: i};
        // areasの添え字は、CSVのいちばん左の県=0
        areas.push(area);
        // 添え字の収集
        idxArr.push(index);
        index++;
    }

    // 扱いやすい形で友好度を保持する
    let friendshipMatrix = formatCsv(csvArr);

    let maxGroup = getMaxGroup(idxArr, friendshipMatrix, 1, 3);
    for (let i = 0; i < maxGroup.length; i++) {
        let group = maxGroup[i];
        for (let idx of group) {
            // CSSをグループ番号1~3で振っているので
            areas[idx].group = i+1;
        }
    }

    return areas;
}

/**
 * 友好度CSVの整形
 * @param {*} csvArr 
 * @returns 
 */
function formatCsv(csvArr) {

    // たとえば
    // x,A県,B県,C県
    // A県,-,100,−50
    // B県,-,-,20
    // C県,-,-,-
    //
    // 下記のように持ち替える
    // [0,100,-50]
    // [100,0,20]
    // [-50,20,0]
    //
    // たとえば、BとCの友好度は[1][2]⇒20、CとBの友好度は[2][1]⇒20。

    let friendshipMatrix = [];

    // 先頭行はヘッダ行なので1オリジン。i-1=areasの添え字になる
    for (let i = 1; i < csvArr.length; i++) {
        let areaRow = [];

        // 1オリジン。いちばん左の列は都県名なので
        for (let j = 1; j < csvArr[i].length; j++) {
            if(i === j) {
                // 自分自身の場合友好度は'-'を0に変換して保持
                areaRow.push(0)
            } else {
                let val = csvArr[i][j];
                if('-' === val) {
                    // 既出ペアの友好度
                    let val2 = csvArr[j][i]
                    areaRow.push(Number(val2));
                } else {
                    areaRow.push(Number(val));
                }
            }
        }
        friendshipMatrix.push(areaRow);
    }
    return friendshipMatrix;
}

/**
 * 友好度が最大となるグループ分けを取得する
 * @param {array} elems 全要素 
 * @param {array} friendshipMatrix 友好度
 * @param {*} minGroupCnt 最小グループ数
 * @param {*} maxGroupCnt 最大グループ数
 */
function getMaxGroup(elems, friendshipMatrix, minGroupCnt, maxGroupCnt) {

    let elemsLen = elems.length;
    let allSubsets = getSubset(elems, elemsLen - 1);

    // 部分集合の友好度を事前に計算しておく
    allSubsets = allSubsets.filter(s => s.length > 0);
    let friendshipMap = new Map();
    let i = 0;
    for (const subset of allSubsets) {
        let innerTotal = 0;
        let combinations = combination(subset, 2);
        for (const combi of combinations) {
            innerTotal += friendshipMatrix[combi[0]][combi[1]];
        }
        friendshipMap.set(i, { subset: subset, friendship: innerTotal });
        i++;
    }

    // 部分集合の組み合わせを作成
    let groups = [];
    let keys = Array.from(friendshipMap.keys());
    for (let i = minGroupCnt; i <= maxGroupCnt; i++) {
        let combinations = combination(keys, i);
        for (const combi of combinations) {
            let total = 0;
            let tmpArr = [];
            for (const c of combi) {
                let subsetInfo = friendshipMap.get(c);
                tmpArr = tmpArr.concat(subsetInfo.subset);
                total += subsetInfo.friendship;
            }

            // 重複がないか、要素数が合っているか
            let uniqueArr = Array.from(new Set(tmpArr));
            if ((uniqueArr.length === tmpArr.length) && (elemsLen === uniqueArr.length)) {
                groups.push({ group: combi, friendship: total });
            }
        }
    }

    // 友好度が最大の組み合わせを取得
    groups.sort(function (a, b) {
        // 友好度の降順
        if (a.friendship > b.friendship) {
            return -1;
        } else if (a.friendship < b.friendship) {
            return 1;
        } else {
            return 1;
        }
    });
    
    let maxCombiKeys = groups[0].group;
    console.log(groups[0].friendship);
    let ret = [];
    for (const key of maxCombiKeys) {
        ret.push(friendshipMap.get(key).subset);
    }
    
    return ret;
}

/**
 * すべての部分集合を列挙する
 * https://www.geeksforgeeks.org/recursive-program-to-generate-power-set/
 * @param {*} set 
 * @param {*} index 
 * @returns 
 */
function getSubset(set, index) {
    let allSubsets = [];

    if (index < 0) {
        let v = [];
        allSubsets.push(v);
    } else {
        allSubsets = getSubset(set, index - 1);
        let item = set[index];
        let moreSubsets = [];

        for (let subset of allSubsets) {
            let newSubset = [];
            for (let it of subset) {
                newSubset.push(it);
            }
            newSubset.push(item);
            moreSubsets.push(newSubset);
        }

        for (let it of moreSubsets)
            allSubsets.push(it);
    }

    return allSubsets;
}

/**
 * 集合numsからk個とる組み合わせを列挙する
 * https://tech-blog.s-yoshiki.com/entry/144
 * @param {*} nums 
 * @param {*} k 
 * @returns 
 */
const combination = (nums, k) => {
    let ans = [];
    if (nums.length < k) {
        return [];
    }
    if (k === 1) {
        for (let i = 0; i < nums.length; i++) {
            ans[i] = [nums[i]];
        }
    } else {
        for (let i = 0; i < nums.length - k + 1; i++) {
            let row = combination(nums.slice(i + 1), k - 1);
            for (let j = 0; j < row.length; j++) {
                ans.push([nums[i]].concat(row[j]));
            }
        }
    }
    return ans;
};