function Date({ text }) {

    const box = { fontSize: ".2em",
		  whiteSpace: "normal",
		  wordWrap: "break-word"};
    const show = { backgroundColor: "powderblue" };  
    const rotate = { transform: "rotate(-60deg)" };
    return (
	<div style={{...box, ...show}}>
		<h1 style={rotate}>{text}</h1>
	</div>
    );
}

export default Date;