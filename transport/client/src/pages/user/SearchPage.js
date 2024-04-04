import { useState, useEffect, React, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import TravelCard from '../../components/TravelCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const SearchPage = () => {
    const query = useQuery();
    const { loading, request } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    
    const [routes, setRoutes] = useState([]);
    const [params, setParams] = useState({
        departure: '',
        destination: '',
        startDate: '',
        numberOfSeats: '',
    });

    const getRoutes = useCallback(async () => {
        const data = await request(`/api/routes/all?departure=${query.get('departure')}&destination=${query.get('destination')}&startDate=${query.get('startDate')}&numberOfSeats=${query.get('numberOfSeats')}`);
        setRoutes(data);
        console.log(data);
    }, [request])

    useEffect(() => {
        setParams({
            departure: query.get('departure'),
            destination: query.get('destination'),
            startDate: query.get('startDate'),
            numberOfSeats: query.get('numberOfSeats'),
        });
    }, []);

    useEffect(() => {
        getRoutes();
    }, [getRoutes]);


    //const formattedStartDate = startDate ? format(new Date(startDate), 'dd MMMM yy') : '';
    //const formattedEndDate = endDate ? format(new Date(endDate), 'dd MMMM yy') : '';
    //const range = `${formattedStartDate} - ${formattedEndDate}`;

    return (
        routes.map(route =>{
            return <TravelCard trip={route} key={route._id} />
        })
    );
}