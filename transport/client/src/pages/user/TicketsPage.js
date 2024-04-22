import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { TicketCard } from '../../components/TicketCard';

export const TicketsPage = () => {
    const { request, loading } = useHttp();
    const [tickets, setTickets] = useState([]);
    const [reviews, setReviews] = useState([]); 
    const userId = useContext(AuthContext).userId;

    const getTickets = useCallback(async () => {
        try {
            const data = await request('/api/tickets/user/' + userId);
            setTickets(data);
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }, [request, userId]);

    const getUserReviews = useCallback(async () => {
        try {
            const data = await request('/api/reviews/' + userId);
            setReviews(data);
            console.log(data);
        } catch (e) {
            console.log(e);
        }
    }, [request]);

    useEffect(() => {
        getTickets();
        getUserReviews();
    }, [getTickets]);

    const returnTicketButtonHandler = async (id) => {
        if (window.confirm('Are you sure you want to return this ticket?')) {
            try {
                const data = await request('/api/tickets/' + id, 'DELETE')
                console.log(data)
                getTickets()    
            } catch (e) {
                console.log(e)
            }
        }
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            {/* {console.log(reviews)}
            {console.log(tickets)} */}
            {tickets.map(ticket => (
                <TicketCard 
                key={ticket._id} 
                ticket={ticket} 
                returnTicketButtonHandler={returnTicketButtonHandler} 
                leaveReviewButtonDisabled={reviews.some(r => r.carrier === ticket.route.transport.carrier)}
                getTickets={getTickets}
                getUserReviews={getUserReviews}/>
            ))}
        </>
    );
};
