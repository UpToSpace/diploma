import { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { TravelCard } from '../../components/TravelCard';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export const SearchPage = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { loading, request } = useHttp();
    const userId = useContext(AuthContext).userId;
    const query = useQuery();

    const [routes, setRoutes] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const getRoutes = useCallback(async () => {
        try {
            const params = `departure=${query.get('departure')}&destination=${query.get('destination')}&numberOfSeats=${query.get('numberOfSeats')}&conditioners=${query.get('conditioners')}&wifi=${query.get('wifi')}&power=${query.get('power')}`;
            const startDate = query.get('startDate');
            const queryString = `/api/routes/all?${params}${startDate ? `&startDate=${startDate}` : ''}`;
            const data = await request(queryString);
            setRoutes(data);
            console.log(data);
        } catch (e) {
            toast.error(e.message);
        }
    }, [search]); // Notice we depend on `search` now, not `query`

    const getFavorites = useCallback(async () => {
        try {
            const data = await request(`/api/favourites/${userId}`);
            setFavorites(data);
        } catch (e) {
            toast.error(e.message);
        }
    }, [userId]);

    useEffect(() => {
        getFavorites();
        getRoutes();
    }, [getRoutes, getFavorites]);

    const likeTrip = async (routeId) => {
        try {
            const favourite = favorites.find(f => f.routeId === routeId);
            if (!favourite) {
                const data = await request(`/api/favourites`, 'POST', { routeId, userId });
                toast(data.message);
            } else {
                const data = await request(`/api/favourites/${favourite._id}`, 'DELETE');
                toast(data.message);
            }
            getFavorites();
        } catch (e) {
            toast.error('Failed to update favorites');
        }
    };

    if (loading) return <Loader />;
    if (routes.length === 0) return <div className="text-center text-2xl mt-10">Рейсы не найдены</div>;

    return (
        <div className='container'>
        {routes.map(route => (
            <TravelCard
                key={route._id}
                trip={route}
                likeButtonHandler={() => likeTrip(route._id)}
                isFavorite={favorites.some(f => f.routeId === route._id)}
            />
        ))}
       </div> 
    );
};

