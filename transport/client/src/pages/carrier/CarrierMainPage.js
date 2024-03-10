import { useState, useEffect, React } from 'react';

export const CarrierMainPage = () => {
    useEffect(() => {
        document.title = 'Main Page';
    }
    );
    return (
        <div>
            <h1>Carrier Main Page</h1>
        </div>
    );
}