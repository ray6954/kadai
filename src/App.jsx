import React from 'react'
import { EstatDataForm } from './EstatDataForm';
import './styles.css';

const MainContent = () => {
    return (
        <>
            <div className="content">
                <EstatDataForm />
            </div>
        </>
    );
};

function App() {
    return (
        <div className="App">
            <MainContent />
        </div>
    );
}

export default App;
