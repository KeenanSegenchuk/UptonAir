import React, {useState, useEffect} from 'react';
import InfoBox from "./InfoBox";

const InfoContainer = ({ infodoc }) => {
  const [infolist, setInfolist] = useState(false);
  const [allStyle, setAllStyle] = useState({});
  
  const loadDoc = async() => {
	try{
		const response = await fetch(infodoc);
		//console.log("Response: ", response);
		const il = await response.json()
		setInfolist(il);
		if(il[0].all)
			setAllStyle(il[0].all);
		else
			setAllStyle({});
		//console.log("Loaded list of infoBoxes:", infolist);
	} catch(err) {
		console.log("Error fetching infolist: ", infodoc, err);
	}
  };
  useEffect(() => {
    loadDoc();
  }, []);

  return (
    <div>
	{infolist ? (infolist.map((info) => (
	    <InfoBox images={info.images && info.images} title={info.title} body={info.body && info.body} style={{
		title: {...(allStyle.title || {}),
			...(info.style?.title || {})},
		both:  {...(allStyle.both || {}),
			...(info.style?.both || {})},
		body:  {...(allStyle.body || {}),
			...(info.style?.body || {})},
		images:{...(allStyle.images || {}),
			...(info.style?.images || {})}
	    }}/>
        ))):(null)}
    </div>
  );
};

export default InfoContainer;
