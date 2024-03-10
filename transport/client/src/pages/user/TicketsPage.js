import React, { useEffect } from 'react';

export const TicketsPage = () => {
    useEffect(() => {
        document.title = 'Tickets';
    }
    );
    return (
        <div>
            <h1>Tickets</h1>
        </div>
    );
}