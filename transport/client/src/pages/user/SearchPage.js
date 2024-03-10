import { useState, useEffect, React } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const SearchPage = () => {
    const query = useQuery();
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [numberOfSeats, setNumberOfSeats] = useState('');

    useEffect(() => {
        setLocation(query.get('location') || '');
        setStartDate(query.get('startDate') || '');
        setEndDate(query.get('endDate') || '');
        setNumberOfSeats(query.get('numberOfSeats') || '');
    }, [query]);

    const formattedStartDate = startDate ? format(new Date(startDate), 'dd MMMM yy') : '';
    //const formattedEndDate = endDate ? format(new Date(endDate), 'dd MMMM yy') : '';
    //const range = `${formattedStartDate} - ${formattedEndDate}`;

    return (
        <div className="flex">
            <h1 className="text-3xl font-semibold mt-2 mb-6">Stays in {location}</h1>
            <p className="text-xs"> - for {numberOfSeats} guests</p>
        </div>
    );
}