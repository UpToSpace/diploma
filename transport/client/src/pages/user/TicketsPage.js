import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';

export const TicketsPage = () => {
    const { request, loading } = useHttp();
    const [tickets, setTickets] = useState([]);
    const userId = useContext(AuthContext).userId;

    const getTickets = useCallback(async () => {
        try {
            const data = await request('/api/tickets/' + userId);
            setTickets(data);
        } catch (e) {
            console.log(e);
        }
    }, [request]);

    useEffect(() => {
        getTickets();
    }, [getTickets]);

    if (loading) {
        return <Loader />;
    }
    return (
        <div>
            <h1 className="text-3xl font-bold">Tickets</h1>
            <div className="grid grid-cols-1 gap-4 mt-4">
                {tickets.map(ticket => (
                    <div key={ticket._id} className="bg-white p-4 rounded shadow">
                        <p className="text-lg">Route: {ticket.route.departure.city} - {ticket.route.destination.city}</p>
                        <p className="text-lg">Date: {new Date(ticket.purchaseDate).toLocaleString()}</p>
                        <p className="text-lg">Cost: ${ticket.cost}</p>
                        <p className="text-lg">Seat: {ticket.seat}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}