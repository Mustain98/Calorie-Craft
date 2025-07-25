import React from 'react';
import logo from '../logo.png';
import './LeftSection.css';

export default function LeftSection () {

    return(

        <div className="left-section">
            <img src={logo} alt="Calorie Craft Logo" className="logo" />
            <h1 className="title">Calorie Craft</h1>
        </div>
    );
}
