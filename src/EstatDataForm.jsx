import React, { useState } from 'react'

import { callEstat } from './api';
import { formatTableData } from './formatTableData';
import { readFileAsText, mapCSVToArray } from './csvReader';

import './styles.css';

export const EstatDataForm = () => {
  const [status, setStatus] = useState({ screen: 'home' });
  const [estatData, setEstatData] = useState([]);

  /**
   * estat検索、表示処理
   * @param {*} event 
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // const searchFrom = form.get("searchFrom") || "";
    // const searchTo = form.get("searchTo") || "";
    const searchFrom = "";
    const searchTo = "";
    const file = form.get("csvFile");
    try {
      if((!file) || file.size === 0) { 
        alert('CSVファイルを選択してください');
      } else {
        const csv = await readFileAsText(file);
        const arr = mapCSVToArray(csv);
        const condition = { from: searchFrom, to: searchTo, csv: arr };
        getTableData(condition);
        setStatus({ screen: 'searched' });
      }
    } catch (error) {
      alert(error);
    }
  };

  /**
   * API問い合わせ、グルーピング、表示用に整形
   * @param {*} condition 
   */
  const getTableData = async (condition) => {
    try {
      callEstat(condition.from, condition.to)
        .then(jsonResponse => setEstatData(formatTableData(jsonResponse, condition.csv)));
    } catch (e) {
      console.log("error", e);
    }
  };

  return (
    <>
      <div className="search-form">
        <form onSubmit={handleSubmit}>
          <span>※CSVファイルは必須<br/>　表示に時間がかかります......</span>
          {/*
          <div>
            <input type="text" name="searchFrom" defaultValue="" placeholder="From(西暦YYYY)" />
            <input type="text" name="searchTo" defaultValue="" placeholder="To(西暦YYYY)" />
          </div>  
          */} 
          <div>
            <input
              type="file"
              className="file"
              accept="text/csv"
              name="csvFile"
            />
          </div>
          <div>
            <input type="submit" value="EstatData表示" />
          </div>
        </form>
      </div>
      {status.screen === 'searched'
        ? <div className="search-result">
          <table>
            {estatData.length === 0
              ? <></>
              : <>
                <thead>
                  <tr>
                    <th></th>
                    {estatData[0].areaData.map((area, index) => (
                      <th key={index} className={"group-" + area.areaInfo.group}>{area.areaInfo.name}</th>
                    ))}
                  </tr>
                </thead>
              </>
            }
            <tbody>
              {estatData.map((item, index) => (
                <tr key={index}>
                  <td class="row-header">{item.timeDisp}</td>
                  {item.areaData.map((area, index2) => (
                    <td key={index2} className={"group-" + area.areaInfo.group}>{area["$"]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        : <div></div>
      }
    </>
  );
}