import { useState } from 'react';

export function useSensorData({ initialLineUnits } = {}) {
  const [rawData, setData] = useState([]);
  const [compressedData, setCompressedData] = useState([]);
  const [epsilon, setEpsilon] = useState(0);
  const [showCompression, setShowCompression] = useState(false);
  const [sensor_id, setSensor_id] = useState("0");
  const [selectedSensors, setSelectedSensors] = useState({});
  const [lineMode, setLineMode] = useState("sensors");
  const [newLineUnit, setNewLineUnit] = useState("");
  const [lineUnits, setLineUnits] = useState(initialLineUnits ?? []);
  const [sensor_idAvgs, setSensor_idAvgs] = useState({});
  const [buttonAvgs, setButtonAvgs] = useState({});

  const isLineSelected = (sensor) => !!selectedSensors[sensor];
  const toggleLineSelect = (sensor) => setSelectedSensors(prev => ({ ...prev, [sensor]: !prev[sensor] }));
  const selectSensor = (sensor) => setSelectedSensors(prev => ({ ...prev, [sensor]: true }));

  return {
    rawData, setData,
    compressedData, setCompressedData,
    epsilon, setEpsilon,
    showCompression, setShowCompression,
    sensor_id, setSensor_id,
    selectedSensors, setSelectedSensors,
    lineMode, setLineMode,
    newLineUnit, setNewLineUnit,
    lineUnits, setLineUnits,
    sensor_idAvgs, setSensor_idAvgs,
    buttonAvgs, setButtonAvgs,
    isLineSelected,
    toggleLineSelect,
    selectSensor,
  };
}
