import React from 'react';
import InfoBox from "./InfoBox";

const InfoContainer = ({ infodoc }) => {
  let infolist = false;
  let allStyle = {};
  fetch(infodoc).then(data=>{console.log("INFOLIST:", data); infolist=new Response(data).text().json();}).catch(error => {console.log("Error fetching infodoc:", error);});
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
