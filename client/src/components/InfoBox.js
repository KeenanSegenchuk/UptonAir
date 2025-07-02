import React from 'react';

const InfoBox = ({ title, body, style, images }) => {
  //console.log("InfoBox Style:", style); 
  return (
    <div style={style.both}>
	<div style={style.title}>
		{title}
	</div>
	<div style={style.body}>
		{body}
	</div>
	<div className="imgContainer" style={style.images}>
		{images && images.map((image, index) => (
				<img src={image} className="staticImg" key={index} alt="Cannot load image." loading="eager"/>
		))}
	</div>
    </div>
  );
};

export default InfoBox;
