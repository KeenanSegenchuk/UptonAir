import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from "../AppContext.js";

const InfoBox = ({ title, id, container_id, body, style, images }) => {
  //Load box with text from JSON thru InfoContainer
  //console.log("InfoBox Style:", style); 

  //help track if the associated switch has changed
  const {switches, setSwitches} = useAppContext();
  const collapseContainer = useMemo(() => {
    return switches.get(container_id);
  }, [switches, container_id]);

  useEffect(() => {
    setCollapsed(!collapseContainer);
  }, [collapseContainer]); 

  const collapseable = style.collapseable ?? true;
  const [collapsed, setCollapsed] = useState(collapseable ? true : false);
  const toggleCollapse = () => {
    if (collapseable) {
      setCollapsed(!collapsed);
      if (id === 0) 
	    setSwitches(prev => {
		const current = new Map(prev);
		current.set(container_id, !current.get(container_id));
		return current;
	    });
    }
  };

  const triangles = id === 0 ? ['▼', '▲'] : ['▽', '△'];
  const arrow = collapseable ? (collapsed ? triangles[0] : triangles[1]) : '';

  return (
    <div id="InfoBox.js" style={style.both}>
      <div
        onClick={toggleCollapse}
        style={{
          ...style?.title,
          cursor: collapseable ? 'pointer' : 'default',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        {title}
        <span>{arrow}</span>
      </div>

      {!collapsed && (
        <>
          <div style={style?.body}>
            {body}
          </div>
          <div className="imgContainer" style={style?.images}>
            {images && images.map((image, index) => (
              <img
                src={image}
                className="staticImg"
                key={index}
                alt="Cannot load image."
                loading="eager"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InfoBox;
