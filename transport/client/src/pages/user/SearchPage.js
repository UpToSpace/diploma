import { useState, useEffect, React, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { TravelCard } from '../../components/TravelCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const SearchPage = () => {
    const query = useQuery();
    const { loading, request } = useHttp();
    const navigate = useNavigate();
    const userId = useContext(AuthContext).userId;

    const [routes, setRoutes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [params, setParams] = useState({
        departure: '',
        destination: '',
        startDate: '',
        numberOfSeats: '',
    });

    const getRoutes = useCallback(async () => {
        try {
            const data = await request(
                `/api/routes/all?departure=${query.get('departure')}&destination=${query.get('destination')}&` +
                `startDate=${query.get('startDate')}&numberOfSeats=${query.get('numberOfSeats')}` +
                `&conditioners=${query.get('conditioners')}&wifi=${query.get('wifi')}&power=${query.get('power')}`);
            setRoutes(data);
            console.log(data);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request])

    const getFavorites = useCallback(async () => {
        try {
            const data = await request(`/api/favourites/${userId}`);
            setFavorites(data);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request]);

    useEffect(() => {
        setParams({
            departure: query.get('departure'),
            destination: query.get('destination'),
            startDate: query.get('startDate'),
            numberOfSeats: query.get('numberOfSeats'),
        });
    }, []);

    useEffect(() => {
        getFavorites();
        getRoutes();
    }, [getRoutes, getFavorites]);

    const likeTrip = async (routeId) => {
        try {
            const favourite = favorites.filter(item => item.routeId === routeId)[0];
            console.log(favourite)
            if (!favourite) {
                const data = await request(`/api/favourites`, 'POST', { routeId, userId });
                toast(data.message);
            } else {
                const data = await request(`/api/favourites/${favourite._id}`, 'DELETE');
                toast(data.message);
            }
            await getFavorites();
        } catch (e) { }
    };

    const likeButtonHandler = async (routeId) => {
        await likeTrip(routeId); // Send the like to the database
        const data = await getFavorites();// Fetch updated list of trips
        setFavorites(data); // Update state with new data
    };


    //const formattedStartDate = startDate ? format(new Date(startDate), 'dd MMMM yy') : '';
    //const formattedEndDate = endDate ? format(new Date(endDate), 'dd MMMM yy') : '';
    //const range = `${formattedStartDate} - ${formattedEndDate}`;
    if (loading || favorites === null || routes === null) {
        return <Loader />
    }

    if (routes?.length === 0) {
        return <div className="text-center text-2xl mt-10">No routes found</div>
    }

    return (
        routes.map(route => {
            return <TravelCard
                trip={route}
                key={route._id}
                likeButtonHandler={() => likeButtonHandler(route._id)}
                isFavorite={favorites && favorites.some(f => f.routeId === route._id)} />
        })
    );
}