// @ts-nocheck
// deno-lint-ignore-file
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/view/editableTR.ts
var focusedRow;
var focusedCell;
var selectedRowID = 0;
var resetFocusedRow = /* @__PURE__ */ __name(() => {
  const dbtn = $("deletebtn");
  dbtn?.setAttribute("hidden", "");
  focusedRow = null;
}, "resetFocusedRow");
function makeEditableRow() {
  const rows = document.querySelectorAll("tr");
  for (const row of Array.from(rows)) {
    if (row.className.startsWith("headerRow")) {
      continue;
    }
    row.onclick = (e) => {
      const target = e.target;
      if (focusedRow && focusedCell && e.target != focusedCell) {
        focusedCell.removeAttribute("contenteditable");
        focusedCell.className = "";
        focusedCell.oninput = null;
      }
      focusedRow?.classList.remove("selected_row");
      focusedRow = row;
      selectedRowID = parseInt(focusedRow.dataset.row_id + "");
      focusedRow.classList.add("selected_row");
      const dbtn = $("deletebtn");
      dbtn.removeAttribute("hidden");
      if (target.attributes.getNamedItem("read-only")) {
        return;
      }
      focusedCell = e.target;
      focusedCell.setAttribute("contenteditable", "");
      focusedCell.className = "editable ";
      focusedCell.onblur = () => {
        const id = parseInt(focusedRow.dataset.row_id + "");
        const col = focusedCell.dataset.column_id || 0;
        const rowObj = buenoCache.get(id);
        const currentValue = rowObj[col];
        const newValue = focusedCell.textContent;
        if (currentValue != newValue) {
          rowObj[col] = newValue;
          buenoCache.set(id, rowObj);
        }
      };
      focusedCell.focus();
    };
  }
}
__name(makeEditableRow, "makeEditableRow");

// src/data/paginate.ts
function paginateData() {
  if (buenoCache.querySet) {
    const { currentPage, rows } = buenoCache;
    const startAt = (currentPage - 1) * rows;
    const endAt = startAt + rows;
    const slicedDataSet = buenoCache.querySet.slice(startAt, endAt);
    const pages = Math.ceil(buenoCache.querySet.length / rows);
    return { "querySet": slicedDataSet, "totalPages": pages };
  } else {
    return { "querySet": null, "totalPages": 0 };
  }
}
__name(paginateData, "paginateData");

// src/view/domPageButtons.ts
var wrapper;
var deleteBtn;
var addBtn;
function buildPageButtons(pages) {
  if (!wrapper) wrapper = $("page-wrapper");
  const { currentPage, window } = buenoCache;
  wrapper.innerHTML = ``;
  let maxLeft = currentPage - Math.floor(window / 2);
  let maxRight = currentPage + Math.floor(window / 2);
  if (maxLeft < 1) {
    maxLeft = 1;
    maxRight = window;
  }
  if (maxRight > pages) {
    maxLeft = pages - (window - 1);
    if (maxLeft < 1) maxLeft = 1;
    maxRight = pages;
  }
  for (let page = maxLeft; page <= maxRight; page++) {
    const classString = currentPage === page ? `"pagebtn currentpagebtn"` : "pagebtn";
    wrapper.innerHTML += `<button 
            value=${page} 
            class=${classString}>${page}
        </button>`;
  }
  if (currentPage != 1) {
    wrapper.innerHTML = `<button 
        value=${1}
        class="pagebtn endbtn">\xAB First</button>` + wrapper.innerHTML;
  }
  if (currentPage != pages) {
    wrapper.innerHTML += `<button 
            value=${pages}
            class="pagebtn endbtn">Last \xBB</button>`;
  }
  wrapper.innerHTML += `<div> <button id='addbtn' class='rowbtn'>Add Row</button>
    <button id='deletebtn' class='rowbtn' hidden> X </button></div>`;
  addBtn = $("addbtn");
  addBtn.onclick = (_e) => {
    console.log("addBtn clicked!");
    const newRow = Object.assign({}, buenoCache.schema.sample);
    if (newRow.id) {
      newRow.id = buenoCache.dbMap.size;
    }
    console.info(newRow);
    console.log("before add thisDB.size ", buenoCache.dbMap.size);
    buenoCache.set(newRow.id, newRow);
    console.info("after add thisDB.size ", buenoCache.dbMap.size);
  };
  deleteBtn = $("deletebtn");
  deleteBtn.onclick = (_e) => {
    const id = focusedRow.dataset.row_id;
    buenoCache.delete(parseInt(id + ""));
    paginateData();
    buildDataTable();
  };
  const pageCollection = document.querySelectorAll(".pagebtn");
  for (let i = 0; i < pageCollection.length; i++) {
    pageCollection[i].addEventListener("click", function() {
      buenoCache.currentPage = Number(pageCollection[i].value);
      paginateData();
      buildDataTable();
    });
  }
}
__name(buildPageButtons, "buildPageButtons");

// src/view/domDataTable.ts
var tableBody;
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
__name(capitalizeFirstLetter, "capitalizeFirstLetter");
var buildTableHead = /* @__PURE__ */ __name(() => {
  const tablehead = $("table-head");
  const tr = `
<tr class="headerRow">
`;
  let th = "";
  for (let i = 0; i < buenoCache.columns.length; i++) {
    th += `    <th id="header${i + 1}" 
   data-index=${i} value=1> ${capitalizeFirstLetter(buenoCache.columns[i].name)} 
   <span class="indicator">\u{1F503}</span>
   <input id="input${i + 1}" type="text">
</th>
`;
  }
  tablehead.innerHTML += tr + th;
  tablehead.innerHTML += `</tr>`;
}, "buildTableHead");
var buildDataTable = /* @__PURE__ */ __name(() => {
  if (!tableBody) tableBody = $("table-body");
  const { querySet, totalPages } = paginateData();
  tableBody.innerHTML = "";
  $("h1").className = "hidden";
  for (let i = 0; i < querySet.length; i++) {
    const obj = querySet[i];
    let row = `<tr data-row_id="${obj[buenoCache.columns[0].name]} ">
        `;
    for (let i2 = 0; i2 < buenoCache.columns.length; i2++) {
      const ro = buenoCache.columns[i2].readOnly ? " read-only" : "";
      row += `<td data-column_id="${buenoCache.columns[i2].name}"${ro}>${obj[buenoCache.columns[i2].name]}</td>
            `;
    }
    row += "</tr>";
    tableBody.innerHTML += row;
  }
  resetFocusedRow();
  buildPageButtons(totalPages);
  makeEditableRow();
}, "buildDataTable");

// src/data/order.ts
var OrderDirection = {
  ASC: "ASC",
  DESC: "DESC",
  UNORDERED: "UNORDERED"
};
var orderData = /* @__PURE__ */ __name((column, direction) => {
  switch (direction) {
    case OrderDirection.ASC:
      buenoCache.querySet.sort((a, b) => a[column] > b[column] ? 1 : -1);
      break;
    case OrderDirection.DESC:
      buenoCache.querySet.sort((a, b) => a[column] < b[column] ? 1 : -1);
      break;
    case OrderDirection.UNORDERED:
      buenoCache.querySet.sort((a, b) => a["id"] > b["id"] ? 1 : -1);
      break;
    default:
      break;
  }
}, "orderData");
var applyOrder = /* @__PURE__ */ __name(() => {
  const indicators = document.querySelectorAll(".indicator");
  for (const ind of Array.from(indicators)) {
    const index = parseInt(ind?.parentElement?.dataset.index + "");
    const dir = buenoCache.columns[index].order;
    orderData(buenoCache.columns[index].name, dir);
  }
}, "applyOrder");

// src/data/filter.ts
var filterData = /* @__PURE__ */ __name((columnName, value) => {
  buenoCache.resetData();
  if (value.length === 0) {
    applyOrder();
    paginateData();
    buildDataTable();
    return;
  } else {
    let filteredData = [];
    buenoCache.querySet.forEach((row) => {
      let it = row[columnName];
      if (typeof it === "number") {
        if (it.toFixed(0).startsWith(value.toString())) {
          filteredData.push(row);
        }
      } else {
        if (it.toLowerCase().startsWith(value.toLowerCase())) {
          filteredData.push(row);
        }
      }
    });
    buenoCache.querySet = filteredData;
    paginateData();
    buildDataTable();
  }
}, "filterData");

// src/view/domEventHandlers.ts
var UP = "\u{1F53C}";
var DOWN = "\u{1F53D}";
var NOT = "\u{1F503}";
var resetIndicators = /* @__PURE__ */ __name(() => {
  const indicators = document.querySelectorAll(".indicator");
  for (const ind of Array.from(indicators)) {
    const index = parseInt(ind.parentElement.dataset.index);
    buenoCache.columns[index].order = OrderDirection.UNORDERED;
    ind.textContent = NOT;
  }
}, "resetIndicators");
var initDOMelements = /* @__PURE__ */ __name(() => {
  buildTableHead();
  let focusedInput;
  for (let i = 0; i < buenoCache.columns.length; i++) {
    const el = $(`header${i + 1}`);
    el.onclick = (e) => {
      const { tagName } = e.target;
      const { ASC, DESC, UNORDERED } = OrderDirection;
      if (tagName === "INPUT") return;
      const header = e.currentTarget;
      const indicator = header.querySelector(".indicator");
      const index = parseInt(header.dataset.index + "");
      const colName = buenoCache.columns[index].name;
      const currentOrder = buenoCache.columns[index].order;
      if (currentOrder == UNORDERED) {
        resetIndicators();
        buenoCache.columns[index].order = ASC;
        orderData(colName, ASC);
        if (indicator) indicator.textContent = DOWN;
      } else if (currentOrder == ASC) {
        resetIndicators();
        buenoCache.columns[index].order = DESC;
        orderData(colName, DESC);
        if (indicator) indicator.textContent = UP;
      } else if (currentOrder == DESC) {
        if (indicator) indicator.textContent = NOT;
        buenoCache.columns[index].order = UNORDERED;
        resetIndicators();
        orderData(colName, UNORDERED);
        paginateData();
      }
      buildDataTable();
    };
  }
  for (let i = 0; i < buenoCache.columns.length; i++) {
    const el = $(`input${i + 1}`);
    el.onkeyup = () => {
      filterData(buenoCache.columns[i].name, el.value);
      if (focusedInput) {
        if (focusedInput != el) {
          focusedInput.value = "";
          focusedInput = el;
        }
      } else {
        focusedInput = el;
        filterData(buenoCache.columns[i].name, el.value);
      }
    };
  }
}, "initDOMelements");

// src/data/objBuilder.ts
var usersJson = await (await fetch(new URL("../data/hundredK.json", import.meta.url))).json();
async function buildTestDataSet(size) {
  return new Promise((resolve, _reject) => {
    const loadStart = performance.now();
    const donnerMap = new Map(usersJson);
    console.log(`time to Load ${donnerMap.size} json records - ${(performance.now() - loadStart).toFixed(2)} ms `);
    console.log(donnerMap.get(0));
    const map = /* @__PURE__ */ new Map();
    const showStart = performance.now();
    for (let index = 0; index < size; index++) {
      const user = donnerMap.get(index).value;
      user.id = index;
      map.set(index, user);
    }
    console.log(`time to Build ${size} records - ${(performance.now() - showStart).toFixed(2)} ms `);
    resolve(map);
  });
}
__name(buildTestDataSet, "buildTestDataSet");

// src/data/buenoCache.ts
var LOG = true;
var BuenoCache = class {
  static {
    __name(this, "BuenoCache");
  }
  IDB_KEY = "";
  schema;
  nextMsgID = 0;
  querySet = [];
  callbacks;
  /** the web-worker that this instance communicates with */
  idbWorker;
  size = 0;
  columns;
  dbMap = /* @__PURE__ */ new Map();
  raw = [];
  currentPage = 1;
  rows = 10;
  window = 10;
  //  BuenoCache ctor
  constructor(opts) {
    this.IDB_KEY = `${opts.schema.name}-${opts.size}`;
    this.schema = opts.schema;
    this.idbWorker = new Worker("./workers/idbWorker.js");
    this.callbacks = /* @__PURE__ */ new Map();
    this.columns = this.buildColumnSchema(this.schema.sample);
    this.size = opts.size;
    this.idbWorker.onmessage = (evt) => {
      const { msgID, error, result } = evt.data;
      if (!this.callbacks.has(msgID)) return;
      const callback = this.callbacks.get(msgID);
      this.callbacks.delete(msgID);
      if (callback) callback(error, result);
    };
    this.hydrate().then((result) => {
      if (result === null) {
        const h1 = document.getElementById("h1");
        if (h1) {
          h1.textContent = `Creating test dataset with - ${opts.size} users! Please Wait!`;
          h1.className = "h1";
        }
        buildTestDataSet(opts.size).then((val) => {
          this.persist(val);
          this.hydrate();
        });
      }
    });
  }
  // ctor end
  /**
   * extract a set of column-schema from the DB.schema object 
   */
  buildColumnSchema(obj) {
    let columns = [];
    for (const [key, value] of Object.entries(obj)) {
      let read_only = false;
      if (typeof value === "number" && value === -1 || typeof value === "string" && value === "READONLY") {
        read_only = true;
      }
      columns.push({
        name: `${key}`,
        type: `${typeof value}`,
        readOnly: read_only,
        order: "UNORDERED"
      });
    }
    return columns;
  }
  /** 
   * Persist the current dbMap to an IndexedDB using         
   * our webworker. (takes ~ 90 ms for 100k records)    
   * This is called for any mutation of the dbMap (set/delete)     
   */
  async persist(map) {
    console.log(`typeof map: ${typeof map}`);
    let valueString = JSON.stringify(Array.from(map.entries()));
    let persistStart = performance.now();
    await this.postMessage({ procedure: "SET", key: this.IDB_KEY, value: valueString });
    let persistTime = (performance.now() - persistStart).toFixed(2);
    if (LOG) console.log(`Persisting ${map.size} records took ${persistTime} ms `);
  }
  /**
   * build Missing Data -> buildTestDataSet -> persist -> RPC-GET
   */
  async buildMissingData() {
    buildTestDataSet(this.size).then(async (val) => {
      console.log(`MissingData value type: ${typeof val}`);
    });
  }
  /**
   * hydrate a dataset from a single raw record stored in IndexedDB    
   * hydrating 100,000 objects takes ~ 295ms :      
   *     DB-Fetch: 133.00ms    
   *     JSON.Parse: 145.30ms    
   *     Build-Map: 16.80ms        
   */
  async hydrate() {
    let fetchStart = performance.now();
    let result = await this.postMessage({ procedure: "GET", key: this.IDB_KEY });
    if (result === "NOT FOUND") {
      return null;
    } else {
      let fetchTime = (performance.now() - fetchStart).toFixed(2);
      let records;
      let parseStart = performance.now();
      if (typeof result === "string") records = JSON.parse(result);
      let parseTime = (performance.now() - parseStart).toFixed(2);
      let mapStart = performance.now();
      this.dbMap = new Map(records);
      let mapTime = (performance.now() - mapStart).toFixed(2);
      let totalTime = (performance.now() - fetchStart).toFixed(2);
      if (LOG) console.log(`Hydrating ${this.dbMap.size} records
         DB-Fetch: ${fetchTime}ms 
         JSON.Parse: ${parseTime}ms 
         Build-CacheMap: ${mapTime}ms 
    Total: ${totalTime}ms`);
      this.raw = [...this.dbMap.values()];
      this.querySet = [...this.raw];
      paginateData();
      buildDataTable();
      return "ok";
    }
  }
  /** resest the working querySet to original DB values */
  resetData() {
    this.querySet = [...this.raw];
  }
  /** find an object from a string key */
  findString(map, value, partial = false) {
    for (const key of map.keys()) {
      if (typeof key === "string")
        if (partial) {
          if (key.startsWith(value)) return map.get(key);
        } else {
          if (key === value) return map.get(key);
        }
    }
    ;
    return `${value} not found!`;
  }
  /** find an object from a number key */
  findNumber(map, value) {
    for (const key of map.keys()) {
      if (key === value) return map.get(key);
    }
    ;
    return `${value} not found!`;
  }
  /** The `set` method mutates - will call the `persist` method. */
  set(key, value) {
    console.log(`set key ${key} val ${JSON.stringify(value)}`);
    try {
      this.dbMap.set(key, value);
      this.persist(this.dbMap);
      this.hydrate();
      console.log("Did set!", key);
      return key.toString();
    } catch (e) {
      console.error("error putting ");
      return "Error " + e;
    }
  }
  /** The `get` method will not mutate records */
  get(key) {
    try {
      let result = this.dbMap.get(key);
      return result;
    } catch (e) {
      return "Error " + e;
    }
  }
  /** 
   * The `delete` method mutates - will call the `persist` method. 
   */
  delete(key) {
    try {
      let result = this.dbMap.delete(key);
      if (result === true) this.persist(this.dbMap);
      this.hydrate();
      return result;
    } catch (e) {
      return "Error " + e;
    }
  }
  /** 
   * Post a message to our IDB webworker     
   * 
   * We give each message a unique id.    
   * We then create/save a promise callback for the id.    
   * Finally, we return a promise for this callback.   
   * Our dbWorker will signal when the rpc has been fulfilled.   
   * At that time we lookup our callback, and fulfill the promise.    
   * This is how we implement async transactions with    
   * our IndexedDB. Since most of the heavy lifting is    
   * on the worker, we never block the UI 
   */
  postMessage(newMessage) {
    const newID = this.nextMsgID++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(newID, (error, result) => {
        if (error) reject(new Error(error.message));
        resolve(result);
      });
      this.idbWorker.postMessage({ callID: newID, payload: newMessage });
    });
  }
};

// src/main.ts
var $ = /* @__PURE__ */ __name((id) => document.getElementById(id), "$");
var options = {
  schema: { name: "Users", sample: { id: -1, first: " ", last: " ", age: 9 } },
  size: 1e5
  // use this to set the size of our test dataset
};
var buenoCache = new BuenoCache(options);
initDOMelements();
export {
  $,
  buenoCache
};
