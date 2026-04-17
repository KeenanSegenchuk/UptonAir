import { useState } from 'react';

export function useGraphConfig() {
  const [getLine, setLine] = useState(null);
  const [globalLineBool, setGlobalLineBool] = useState(false);
  const [hover, setHover] = useState("");
  const [switches, setSwitches] = useState(new Map());
  const [dataContext, setDataContext] = useState("7-Day");
  const [dashboardConfig, setDashboardConfig] = useState({
    plot_type: "echarts",
    units: "AQIEPA",
    map_type: "satellite",
    line_units: [],
  });
  const [buttonPositions, setButtonPositions] = useState({ goal: {}, no_overlap: {} });

  return {
    getLine, setLine,
    globalLineBool, setGlobalLineBool,
    hover, setHover,
    switches, setSwitches,
    dataContext, setDataContext,
    dashboardConfig, setDashboardConfig,
    buttonPositions, setButtonPositions,
  };
}
