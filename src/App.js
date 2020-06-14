import React from 'react';
import logo from './logo.svg';
import './App.scss';
import Invoice from './main/Invoice';

function App() {
    //<img src={logo} className="App-logo" alt="logo" />
    //<p>Edit <code>src/App.js</code> and save to reload.</p>
    //<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
    return (
        <div className="App">
            <header className="App-header">
                <Invoice/>
            </header>
        </div>
    );
}

export default App;
