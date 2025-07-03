import React, { useState } from 'react';

const InfoBox = ({ title, body, style, images }) => {
  //Load box with text from JSON thru InfoContainer
  //console.log("InfoBox Style:", style); 

  const collapseable = style.collapseable ?? true;
  const [collapsed, setCollapsed] = useState(collapseable ? true : false);
  const toggleCollapse = () => {
    if (collapseable) {
      setCollapsed(!collapsed);
    }
  };
  const arrow = collapseable ? (collapsed ? '▽' : '△') : '';

  return (
    <div style={style.both}>
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
