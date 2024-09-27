function SensorInfo({ data }) {
    const floatBox = {
	padding: "10px",
	border: "1px solid #000",
    };
    const floatContainer = {
	display: "flex", // Use flexbox for layout
	justifyContent: "space-around", // Optional, for spacing
    };
    return (
	<div>
	<center>
	    <h1>Sensor: {data.id}</h1>
	</center>
	<h1>Averages:</h1>
        <div style = {floatContainer}>
	    {data.inputs.map(input => (
                <h1 style = {floatBox}>{input}</h1>
            ))}
        </div>
	<div style = {floatContainer}>
	    {data.avgs.map(avg => (
                <h1 style = {floatBox}>{Math.round(100 * avg) / 100}</h1>
            ))}
        </div>
	<h1 style={{textAlign: "center",}}>{data.graphTitle}</h1>
	<img src={data.graphURL} />
	</div>
    );
}

export default SensorInfo;