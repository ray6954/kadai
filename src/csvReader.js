/**
 * CSVファイル取得
 * @param {*} file 
 * @returns 
 */
const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reject(reader.error)
      };
      reader.onload = () => {
        resolve((reader.result) || '')
      };
      reader.readAsText(file);
    });
  }

/**
 * CSVファイルの内容を配列で返す
 * @param {*} csv 
 * @returns 
 */
const mapCSVToArray = (csv) => {
    console.log('mapCSVToArray');
    return csv.split('\r\n').map((row) => row.split(','));
  }

  export { readFileAsText, mapCSVToArray };