import React from 'react';

const InfoBox = ({ title, body, style }) => {
  return (
    <div>
	<div style={{...style.both, ...style.title}}>
		{title}
	</div>
	<div style={{...style.both, ...style.body}}>
		{body}
	</div>
    </div>
  );
};

export default InfoBox;
