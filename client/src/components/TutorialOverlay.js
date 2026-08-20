import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppContext } from "../AppContext";
import "../App.css";

// How far the popup sits from the highlighted element, and how close it can get to the viewport edge
const POPUP_MARGIN = 15;
const EDGE_PADDING = 10;

// Try `placement` first, then the other sides, then clamp to the viewport as a last resort
function computePopupPosition(rect, placement, popupWidth, popupHeight) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	const candidates = {
		bottom: { top: rect.bottom + POPUP_MARGIN, left: rect.left },
		top: { top: rect.top - POPUP_MARGIN - popupHeight, left: rect.left },
		right: { top: rect.top, left: rect.right + POPUP_MARGIN },
		left: { top: rect.top, left: rect.left - POPUP_MARGIN - popupWidth },
	};

	const fits = (pos) =>
		pos.top >= 0 &&
		pos.left >= 0 &&
		pos.top + popupHeight <= vh &&
		pos.left + popupWidth <= vw;

	const order = [...new Set([placement, 'bottom', 'right', 'top', 'left'].filter(Boolean))];
	const chosenKey = order.find((key) => fits(candidates[key])) || order[0];
	const chosen = candidates[chosenKey];

	return {
		top: Math.min(Math.max(chosen.top, EDGE_PADDING), vh - popupHeight - EDGE_PADDING),
		left: Math.min(Math.max(chosen.left, EDGE_PADDING), vw - popupWidth - EDGE_PADDING),
	};
}

//define each step in the tutorial
const steps = [
	{
		target: '[tutorial-label="Map"]',
		title: 'Upton Air Map',
		text: 'Here you can see sensor readings from the past hour and select which sensor to show more data.',
		placement: 'right'
	},
	{
		target: '[tutorial-label="Banner"]',
		title: 'Current Air Quality',
		text: "The past hour's average air quality can be found here."
	},
	{
		target: '[tutorial-label="Historical Averages"]',
		title: 'Historical Averages',
		text: 'You can see historical averages here. Click the buttons under "Recent Averages" to change the timespan of the graph.'
	},
	{
		target: '[tutorial-label="Graph"]',
		title: 'The Graph',
		text: 'This graph shows historical air quality data. You can use the scroller on the bottom to zoom in to a specific time.'
	},
	{
		target: '[tutorial-label="Options"]',
		title: 'Dashboard Options',
		text: 'Getting into the meat of the dashboard, here you can change what air quality units you want to inspect, or switch the graph to Line Mode to graph multiple sensors. In Line Mode you can also graph multiple measurements from the same sensor to compare them.'
	},
	{
		target: '[tutorial-label="Units"]',
		title: 'Different Measurements',
		text: 'By default we show AQI readings that have been callibrated based on humidity to better match EPA regulatory sensors. If you would like to view the default PurpleAir AQI readings, select Unadjusted AQI. NOTE: The selected measurement is saved in your browser cookies, so changes to this setting will persist across site visits.'
	},
	{
		target: '[tutorial-label="Header"]',
		title: 'Other Pages',
		text: 'You can use the buttons on the page header to find more info about air quality monitoring (left) or sign up for email alerts (right).'
	},
];

function TutorialOverlay({}) {
    const [stepIndex, setStepIndex] = useState(-1);
    const [rect, setRect] = useState(null);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
    const popupRef = useRef(null);
    const {showConfig, setShowConfig} = useAppContext();

    //*****handle step changes*****


    const step = steps[stepIndex];

    // Find the element we're currently explaining
    const updatePosition = () => {
        const element = document.querySelector(step?.target);

        if (!element) {
            setRect(null);
            return;
        }

        setRect(element.getBoundingClientRect());
    };

    // Make sure DashboardConfig is visible for the relevant tutorial steps
    const showComponents = () => {
	if (stepIndex === 4 || stepIndex === 5) {
		setShowConfig(true);
	}
	if (stepIndex === 6) {
		setShowConfig(false);
	}
    };


    // Ask DashboardConfig to show/hide itself for the relevant steps
    useEffect(() => {
	showComponents();
    }, [stepIndex]);

    // Recalculate position once stepIndex OR showConfig settles. DashboardConfig
    // toggles its target elements via `display: showConfig ? "block" : "none"`
    // rather than mounting/unmounting them, so we can't compute the rect until
    // showConfig has actually propagated through context and DashboardConfig
    // has re-rendered with display:block.
    useEffect(() => {
        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [stepIndex, showConfig]);

    // Recompute the popup's position once its actual size is known, so placement
    // adapts to the target element and flips/clamps to stay on screen
    useLayoutEffect(() => {
        if (!rect || !popupRef.current) return;

        const popupRect = popupRef.current.getBoundingClientRect();
        setPopupPos(computePopupPosition(rect, step.placement, popupRect.width, popupRect.height));
    }, [rect, stepIndex]);

    const next = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            // Tutorial finished
            setStepIndex(-1);
        }
    };

    const previous = () => {
        if (stepIndex > -1) {
            setStepIndex(stepIndex - 1);
        }
    };


    //*****render overlay*****


    if (!rect || !step) {
	return (
	    <button
		className="green bordered"
	        onClick={next}
	        style={{
	            position: 'fixed',
	            bottom: '20px',
	            right: '20px',
	            zIndex: 10000,
	            padding: '12px 20px',
	            cursor: 'pointer',
		    fontSize: '1.2em'
	        }}
	    >
	        Start Tutorial
	    </button>
	);
    }

    return (
        <>
            {/* Darkened background */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                }}
            />

            {/* Highlight around the target */}
            <div
                style={{
                    position: 'fixed',
                    top: rect.top - 5,
                    left: rect.left - 5,
                    width: rect.width + 10,
                    height: rect.height + 10,

                    border: '3px solid white',
                    borderRadius: '6px',

                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            />

            {/* Popup */}
            <div
                ref={popupRef}
                style={{
                    position: 'fixed',
                    top: popupPos.top,
                    left: popupPos.left,

                    width: '300px',
                    padding: '20px',

                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',

                    zIndex: 10000,
                }}
            >
                <h3>{step.title}</h3>

                <p>{step.text}</p>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <button
                        onClick={previous}
                        disabled={stepIndex === 0}
                    >
                        Back
                    </button>

                    <span>
                        {stepIndex + 1} / {steps.length}
                    </span>

                    <button onClick={next}>
                        {stepIndex === steps.length - 1
                            ? 'Finish'
                            : 'Next'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default TutorialOverlay;