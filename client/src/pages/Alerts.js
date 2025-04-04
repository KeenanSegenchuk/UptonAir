import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import "../App.css";
import "../DeepseekCSSorcery/Alerts.css";
import LinkButton from "../components/LinkButton";
import { Link } from 'react-router-dom'

function Alerts() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [customCountryCode, setCustomCountryCode] = useState('');
    const [showCustomCodeInput, setShowCustomCodeInput] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('email');

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePhoneChange = (event) => {
        // Remove any non-digit characters
        const cleanedValue = event.target.value.replace(/\D/g, '');
        setPhone(cleanedValue);
    };

    const handleCountryCodeChange = (event) => {
        const value = event.target.value;
        if (value === 'other') {
            setShowCustomCodeInput(true);
            setCountryCode('+'); // Start with just the +
        } else {
            setShowCustomCodeInput(false);
            setCountryCode(value);
        }
    };

    const handleCustomCodeChange = (event) => {
        let value = event.target.value;
        // Ensure it starts with + and only contains numbers after
        if (!value.startsWith('+')) {
            value = '+' + value.replace(/\D/g, '');
        } else {
            value = '+' + value.slice(1).replace(/\D/g, '');
        }
        setCustomCountryCode(value);
        setCountryCode(value);
    };

    const showNotification = (message, isSuccess = true) => {
        setNotification({ message, isSuccess });
        setTimeout(() => setNotification(null), 3000);
    };

    const addContact = () => {
        const contactInfo = activeTab === 'email' 
            ? email 
            : `${showCustomCodeInput ? customCountryCode : countryCode}${phone}`;

        if (!contactInfo) {
            showNotification('Please enter your contact information', false);
            return;
        }

        if (activeTab === 'phone' && !phone) {
            showNotification('Please enter a valid phone number', false);
            return;
        }

        axios.post(`http://localhost:5000/alerts/${activeTab}/add/${contactInfo}`)
            .then(response => {
                showNotification('Successfully added contact information!');
                console.log("Response from contact info add request:", response);
            }).catch(error => {
                showNotification('Error adding contact information', false);
                console.log("Error adding contact info to alerts:", error);
            });
    };

    const removeContact = () => {
        const contactInfo = activeTab === 'email' 
            ? email 
            : `${showCustomCodeInput ? customCountryCode : countryCode}${phone}`;

        if (!contactInfo) {
            showNotification('Please enter your contact information', false);
            return;
        }

        axios.post(`http://localhost:5000/alerts/${activeTab}/remove/${contactInfo}`)
            .then(response => {
                showNotification('Successfully removed contact information');
                console.log("Response from contact info remove request:", response);
            }).catch(error => {
                showNotification('Error removing contact information', false);
                console.log("Error removing contact info from alerts:", error);
            });
    };

    return (
      <div style={{width:"100%"}}>
	{/*Header*/}
	<div className="title" style={{display:"flex", height:"70px", aligItems:"center", flexDirection:"horizontal"}}>
	    <LinkButton style={{marginLeft:"0px", marginRight:"auto"}} text="Back to homepage" right={false} href="http://localhost:3000"/>
            <h1 className="titleText" style={{position: "absolute"}}>Upton Air</h1>
	</div>
	
        <div className="alerts-container">
	        <center className="title">
                    <h1>Air Quality Alerts</h1>
                    <p className="subtitle">Stay informed about your local air quality</p>
                </center>

            <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                >
                    Email Alerts
                </button>
                <button 
                    className={`tab-button ${activeTab === 'phone' ? 'active' : ''}`}
                    onClick={() => setActiveTab('phone')}
                >
                    SMS Alerts
                </button>
            </div>

            <div className="alert-description">
                {activeTab === 'email' ? (
                    <p>Enter your email address to receive notifications when the air quality in your area reaches unhealthy levels.</p>
                ) : (
                    <p>Enter your phone number to receive SMS alerts when the air quality in your area reaches unhealthy levels.</p>
                )}
            </div>

            {activeTab === 'email' ? (
                <div className="input-group">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={handleEmailChange} 
                        placeholder="your.email@example.com" 
                        className="input-field"
                    />
                </div>
            ) : (
                <div className="phone-input-group">
                    <div className="country-code-selector">
                        <select 
                            value={showCustomCodeInput ? 'other' : countryCode} 
                            onChange={handleCountryCodeChange}
                            className="country-code-select"
                        >
                            <option value="+1">+1 (USA/Canada)</option>
                            <option value="other">Other</option>
                        </select>
                        
                        {showCustomCodeInput && (
                            <input
                                type="text"
                                value={customCountryCode}
                                onChange={handleCustomCodeChange}
                                placeholder="+[country code]"
                                className="custom-country-code"
                                maxLength="5"
                            />
                        )}
                    </div>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={handlePhoneChange} 
                        placeholder="5551234567" 
                        className="input-field phone-number-input"
                    />
                </div>
            )}

            <div className="button-group">
                <button onClick={addContact} className="action-button add-button">
                    Subscribe to Alerts
                </button>
                <button onClick={removeContact} className="action-button remove-button">
                    Unsubscribe
                </button>
            </div>

            {notification && (
                <div className={`notification ${notification.isSuccess ? 'success' : 'error'}`}>
                    {notification.message}
                </div>
            )}

            <div className="disclaimer">
                <small>We respect your privacy. Your contact information will only be used for air quality alerts.</small>
            </div>
        </div>
      </div>
    );
}

export default Alerts;