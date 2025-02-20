import React from 'react';
import InfoBox from "./InfoBox";

const InfoContainer = ({ infodoc }) => {
  let infolist = false;
  let allStyle = {};
  
  const loadDoc = async() => {
	try{
		const response = await fetch(infodoc);
		console.log("Response: ", response);
		infolist= await response.json();
		console.log("Loaded list of infoBoxes:", infolist);
	} catch(err) {
		console.log("Error fetching infolist: ", err);
	}
  };

  console.log(infodoc);
  loadDoc();
  console.log("Loaded list of infoBoxes: ", infolist);

  if(infolist && infolist[0].all){
    allStyle = infolist[0].all;}

  return (
    <div>
	{infolist ? (infolist.map((info) => (
	    <InfoBox title={info.title} body={info.body} style={{...allStyle, ...info.style}}/>
        ))):(null)}
    </div>
  );
};

export default InfoContainer;
