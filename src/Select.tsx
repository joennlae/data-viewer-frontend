import { CondOperator, RequestQueryBuilder } from '@nestjsx/crud-request';
import React, { useState, useEffect } from 'react';
import Select, { Props } from 'react-select';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Symbols, Tooltip, XAxis, YAxis } from 'recharts';
import chroma from 'chroma-js';
import DataTable from 'react-data-table-component';

export interface LayerOptions {
  layer_name: string,
  layer_name_canonical: string
}

interface InputData {
  id: number,
  index: number,
  C: number,
  H_size: number,
  K: number,
  L_size: number,
  encoding_algorithm: number,
  learned_d: number,
  learned_m: number,
  learned_n: number,
  mae: number,
  mape: number,
  mse: number,
  rows: 1,
  scaled_error: number,
  scaled_shift: number,
  top_1_accuracy: number,
  top_5_accuracy: number,
  total_time: number,
  hue_string: string,
  test_name: string,
  layer_name_canonical: string,
  layer_name: string,
  row_name: string,
  col_name: string,
  top_1_accuracy_100: number
}

interface CustomSelectProps extends Props {
  options: LayerOptions[] | any,
  depended_options: any
  api_path?: string
  method?: string
  placeholder: string,
  mapping_function?: (elem: any) => any | null
}

const colourStyles = {
  container: (base: any) => ({
    ...base,
    flex: 1
  }),
  control: (styles: any) => ({ ...styles }),
  option: (styles: { [x: string]: any; }, { data, isDisabled, isFocused, isSelected }: any) => {
    if (data.color) {
      const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isDisabled
          ? null
          : isSelected
            ? data.color
            : isFocused
              ? color.alpha(0.1).css()
              : null,
        color: isDisabled
          ? '#ccc'
          : isSelected
            ? chroma.contrast(color, 'white') > 2
              ? 'white'
              : 'black'
            : data.color,
        cursor: isDisabled ? 'not-allowed' : 'default',

        ':active': {
          ...styles[':active'],
          backgroundColor:
            !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
        },
      };
    } else {
      return styles;
    }

  },
  multiValue: (styles: any, { data }: any) => {
    if (data.color) {
      const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: color.alpha(0.1).css(),
      };
    } else {
      return styles
    }

  },
  multiValueLabel: (styles: any, { data }: any) => {
    if (data.color) {
      return {
        ...styles,
        color: data.color,
      }
    } else {
      return styles
    }
  },
  multiValueRemove: (styles: any, { data }: any) => {
    if (data.color) {
      return {
        ...styles,
        color: data.color,
        ':hover': {
          backgroundColor: data.color,
          color: 'white',
        }
      }
    } else {
      return styles
    }
  },
  menuList: (provided: any, state: any) => ({
    ...provided,
    // border: '10px white',
    // color: '#191b1f',
    // backgroundColor: '#191b1f',
  }),
  menu: (provided: any) => ({ ...provided })
};

export const CustomSelect = (props: CustomSelectProps) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (props.options) {
      setOptions(props.options);
    }
  }, [props.options]);

  useEffect(() => {
    setIsLoading(true)
    if (props.api_path) {
      fetch(props.api_path, {
        method: props.method,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'no-cors'
        },
      }).then(res => res.json()).then(data => {
        if (props.mapping_function !== undefined) {
          setOptions(data.map(props.mapping_function));
        } else {
          setOptions(data);
        }
      });
    }
    setIsLoading(false)
  }, [props.depended_options, props.method, props.api_path, props.mapping_function]);
  return (
    <Select
      closeMenuOnSelect={true}
      defaultValue={options[0]}
      options={options}
      styles={colourStyles}
      onChange={props.onChange}
      placeholder={props.placeholder}
      isLoading={isLoading}
      isMulti={props.isMulti}
      // className={"mb-2"}
      // value={sessions.filter(function(session) {
      //     return session.value === props.session;
      //   })}
      isSearchable={props.isSearchable}
      noOptionsMessage={() => 'Loading options...'}
    />
  )
}

const BASE_URL = "http://localhost:3000"

enum SelectionType {
  LAYERS = 0,
  K,
  C,
  ALGO
}

interface SelectedOptions {
  value: string | number,
  label: string
}

const algoName = ["FOUR_DIM_HASH (0)", "DESICION_TREE (1)", "FULL_PQ (2)"]

const CustomTooltip = ({ active, payload, label }: { active?: any, payload?: any, label?: any }) => {
  if (active && payload && payload.length) {
    var lines: any[] = [];
    let all_ids: number[] = [];
    let double_id = false;
    payload = payload.sort((a: { value: number; }, b: { value: number; }) => b.value - a.value)
    payload.forEach((elem: any) => {
      if (elem.payload && elem.payload["rows"]) {
        if (elem.payload["rows"] !== label) {
          return;
        }
      }
      if (elem.payload && elem.payload["id"] && all_ids.includes(elem.payload["id"])) {
        double_id = true;
      } else if (elem.payload && elem.payload["id"]) {
        all_ids.push(elem.payload["id"])
      }
      lines.push(
        <div>
          <p style={{ "color": elem.stroke }} key={elem.payload["C"] + "-" + elem.payload["K"] + "-" + elem.payload["encoding_algorithm"]}>
            {elem.payload["C"] + "-" + elem.payload["K"] + "-" + elem.payload["encoding_algorithm"]}: {elem.value.toFixed(2) + " %"}
          </p>
        </div>)
    });
    if (double_id) return null;
    return (
      <div className="custom-tooltip">
        <p key="yolo" className="label">{`Training Images ${label}`}</p>
        {lines}
      </div>

    );
  }

  return null;
};

// 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye'
const k_to_symbols = new Map().set(4, 'circle').set(8, 'cross').set(16, 'diamond').set(24, 'square').set(32, 'star').set(64, 'wye')

const algoColors = ['#ff0000', '#007614', '#0000ff']

export const CombinedSelector = () => {

  const [layers, setLayers] = useState<(string | number)[]>([]);
  const [Ks, setKs] = useState<(string | number)[]>([]);
  const [Cs, setCs] = useState<(string | number)[]>([]);
  const [algos, setAlgos] = useState<(string | number)[]>([]);

  const [isDeactivateBad, setDeactivateBad] = useState<boolean>(false);
  const [isShowReference, setShowReference] = useState<boolean>(false);
  const [all_data, setAllData] = useState<any[]>([]);

  const [xTicks, setXTicks] = useState<any[]>([]);

  const [filtered_data, setFilteredData] = useState<{ line_name: string; value: any; color: string; symbol: any; strokeDash: string | number }[]>([]);

  function loadLayerData(layers: any) {
    if (layers.length) {
      const queryString = RequestQueryBuilder.create()
      for (let layer in layers) {
        queryString.setOr({ field: "layer_name_canonical", operator: CondOperator.EQUALS, value: layers[layer]["value"] })
      }
      let query = queryString.query()
      fetch(BASE_URL + '/parametersweep?' + query, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json()).then(data => {
        setAllData(data);
      });
    } else {
      setAllData([]);
    }
  }

  useEffect(() => {
    let filtered_data = all_data
      .filter(elem =>
        (Ks.includes(elem["K"]) && Cs.includes(elem["C"]) && algos.includes(elem["encoding_algorithm"])))
      .sort((a, b) => a["rows"] - b["rows"])

    if (isDeactivateBad) {
      filtered_data = filtered_data.filter(elem => !(elem["encoding_algorithm"] === 0 && elem["K"] !== 16))
    }
    let rows: number[] = all_data
      .map(elem => elem["rows"])
      .filter(onlyUnique).sort((a, b) => a - b)
    setXTicks(rows);

    let line_map = new Map();
    filtered_data.forEach(elem => {
      let line_name = "C = " + elem["C"] + ", " + "K = " + elem["K"] + ", " + "Enc = " + elem["encoding_algorithm"] + ", L = " + elem["layer_name_canonical"]
      let old_value = line_map.get(line_name)
      if (old_value !== undefined) {
        old_value.push(elem)
        line_map.set(line_name, old_value)
      }
      else {
        line_map.set(line_name, [elem])
      }
    })
    let array: { line_name: string, value: any[], color: string, symbol: "cross", strokeDash: number | string }[] = Array.from(line_map, ([line_name, value]) => ({ line_name, value, color: "", symbol: "cross", strokeDash: 0 }));
    for (let i = 0; i < array.length; i++) {
      let missing_rows = [];
      let rows_containing: number[] = array[i].value
        .map((elem: any) => elem["rows"])
        .filter(onlyUnique).sort((a: number, b: number) => a - b)

      for (let r_i = 0; r_i < rows.length; r_i++) {
        if (!rows_containing.includes(rows[r_i])) {
          missing_rows.push(rows[r_i]);
        }
      }
      if (array[i].value[0] && array[i].value[0]["encoding_algorithm"] !== undefined) {
        // color
        let baseColor = chroma(algoColors[array[i].value[0]["encoding_algorithm"]]);
        array[i].color = baseColor.darken(Math.floor(Math.log2(array[i].value[0]["C"]) - 4)).hex();
        array[i].symbol = k_to_symbols.get(array[i].value[0]["K"])
        if (layers.length > 1) {
          let dashOptions = [0, "2 2", "4 1"]
          array[i].strokeDash = dashOptions[layers.indexOf(array[i].value[0]["layer_name_canonical"]) % dashOptions.length]
        }
      }

      for (let k = 0; k < missing_rows.length; k++) {
        array[i].value.push({ "rows": missing_rows[k], "top_1_accuracy_100": null });
      }
      if (missing_rows.length) {
        array[i].value = array[i].value.sort((a: { [x: string]: number; }, b: { [x: string]: number; }) => a["rows"] - b["rows"])
      }

    }
    setFilteredData(array);
  }, [layers, all_data, Cs, Ks, algos, isDeactivateBad])

  function handleChangeAll(type: SelectionType) {
    return (data: SelectedOptions[] | any) => {
      if (type === SelectionType.LAYERS) {
        setLayers(data.map((elem: { value: any; }) => elem.value));
        loadLayerData(data);
      } else if (type === SelectionType.C) {
        setCs(data.map((elem: { value: any; }) => elem.value));
      } else if (type === SelectionType.K) {
        setKs(data.map((elem: { value: any; }) => elem.value));
      } else if (type === SelectionType.ALGO) {
        setAlgos(data.map((elem: { value: any; }) => elem.value));
      }
    }
  }

  function onlyUnique(value: any, index: number, self: any) {
    return self.indexOf(value) === index;
  }

  const columns = [
    {
      name: "Layer Name",
      selector: (row: InputData) => row.layer_name,
      sortable: true
    },
    {
      name: "C",
      selector: (row: InputData) => row.C,
      sortable: true,
      width: "60px"
    },
    {
      name: "K",
      selector: (row: InputData) => row.K,
      sortable: true,
      width: "60px"
    },
    {
      name: "Encoding",
      selector: (row: InputData) => row.encoding_algorithm,
      sortable: true,
      width: "80px"
    },
    {
      name: "Top-1 Accuracy [%]",
      selector: (row: InputData) => row.top_1_accuracy_100.toFixed(3),
      sortable: true
    },
    {
      name: "L_size [bytes]",
      selector: (row: InputData) => row.L_size + " (" + Math.floor(row.L_size / 1024) + " KB)",
      sortable: true,
    },
    {
      name: "Scaled error",
      selector: (row: InputData) => row.scaled_error.toExponential(3),
      sortable: true,
      width: "120px"
    },
    {
      name: "MSE",
      selector: (row: InputData) => row.mse.toExponential(3),
      sortable: true,
      width: "100px"
    },
    {
      name: "MAE",
      selector: (row: InputData) => row.mae.toExponential(3),
      sortable: true,
      width: "100px"
    },
  ];

  return (
    <>
      <CustomSelect
        options={[]}
        depended_options={[]}
        api_path={BASE_URL + '/parametersweep/allLayers'}
        method='GET'
        mapping_function={(elem: LayerOptions) => ({ "label": elem.layer_name, "value": elem.layer_name_canonical })}
        isMulti={true}
        placeholder='Select Layers'
        onChange={handleChangeAll(SelectionType.LAYERS)} />
      <div style={{ height: "20px" }}></div>
      <CustomSelect
        options={all_data
          .map(elem => elem["C"])
          .filter(onlyUnique)
          .sort((a, b) => a - b)
          .map(elem => ({ value: elem, label: "C = " + elem }))}
        depended_options={[all_data]}
        isMulti={true}
        placeholder='Select C'
        onChange={handleChangeAll(SelectionType.C)} />
      <div style={{ height: "20px" }}></div>
      <CustomSelect
        options={all_data
          .map(elem => elem["K"])
          .filter(onlyUnique)
          .sort((a, b) => a - b)
          .map(elem => ({ value: elem, label: "K = " + elem }))}
        depended_options={[all_data]}
        isMulti={true}
        placeholder='Select K'
        onChange={handleChangeAll(SelectionType.K)} />
      <div style={{ height: "20px" }}></div>
      <CustomSelect
        options={all_data
          .map(elem => elem["encoding_algorithm"])
          .filter(onlyUnique)
          .sort((a, b) => a - b)
          .map(elem => ({ value: elem, label: "Algo = " + algoName[elem], color: algoColors[elem] }))}
        depended_options={[all_data]}
        isMulti={true}
        placeholder='Select encoding algorithm'
        onChange={handleChangeAll(SelectionType.ALGO)} />
      <div style={{ height: "20px" }}></div>

      {/* TODO add show max button */}

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          width={500}
          height={500}
          data={filtered_data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rows" type="number" scale="log" domain={['dataMin', 'dataMax']} allowDecimals={false} ticks={xTicks} />
          <YAxis domain={['dataMin - 0.05', isShowReference ? 81 : 'dataMax + 0.05']} tickFormatter={(value, index) => value.toFixed(2)} allowDecimals={true} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={80.858} label="Resnet-50 80.858%" stroke="red" />
          {filtered_data.map(line =>
            <Line
              type="monotone"
              dataKey="top_1_accuracy_100"
              stroke={line.color}
              connectNulls
              data={line.value}
              name={line.line_name}
              dot={<Symbols type={line.symbol} size={30} />}
              activeDot={<Symbols type={line.symbol} size={100} />}
              legendType={line.symbol}
              strokeWidth={2}
              strokeDasharray={line.strokeDash}
              key={line.line_name} />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ flexDirection: 'row' }}>
        <button style={{ marginTop: '10px', marginRight: '10px', borderColor: 'grey', borderWidth: '1px' }} onClick={() => setDeactivateBad(!isDeactivateBad)}>{isDeactivateBad ? 'Show' : 'Remove'} bad ones</button>
        <button style={{ marginTop: '10px', borderColor: 'grey', borderWidth: '1px' }} onClick={() => setShowReference(!isShowReference)}>{isShowReference ? 'Hide' : 'Show'} reference</button>
      </div>
      <DataTable
        title="Data"
        columns={columns}
        data={filtered_data.map(elem => elem.value).flat().filter(elem => elem["top_1_accuracy_100"])}
        defaultSortFieldId="L_size" />
    </>
  )
}
