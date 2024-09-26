function Map({ buttons }) {
    return (
        <div className="map-container" style={{ position: 'relative' }}>
            <img src="/figs/upton.jpg" alt="Map" />
            <div className="sensor-overlay" style={{ position: 'absolute', top: 0, left: 0 }}>
                {buttons.map((button, index) => (
                    <Button key={index} x={button.x} y={button.y} color={button.color} />
                ))}
            </div>
        </div>
    );
}

const Button = ({ x, y, color }) => {
    return (
        <button
            style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                top: y,
                left: x,
                backgroundColor: color,
            }}
        >
            {/* Button content can be added here */}
        </button>
    );
};

export default Map;