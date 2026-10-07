import React, {} from 'react';
import "../App.css";
import LinkButton from "../components/LinkButton";
import config from "../config.json";

function SiteHeader({ pageTitle, leftLabel, leftLabelExpanded, leftLink, rightLabel, rightLabelExpanded, rightLink }) {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
	    <div className="title" style={{display:"flex", height:"70px", width:"100%"}}>
	        <LinkButton className="leftLinkButton" text={isMobile?leftLabel:(leftLabelExpanded?leftLabelExpanded:"To " + leftLabel)} right={false} href={leftLink}/>
                <h1 className="titleText">{isMobile ? config.WEBPAGE_TITLE : config.WEBPAGE_TITLE + " " + pageTitle}</h1>
	        <LinkButton className="rightLinkButton" text={isMobile?rightLabel:(rightLabelExpanded?rightLabelExpanded:"To " + rightLabel)} right={true} href={rightLink}/>
            </div>
    );
}



export default SiteHeader;