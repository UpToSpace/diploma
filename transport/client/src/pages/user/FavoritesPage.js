import { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { TravelCard } from '../../components/TravelCard';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';

export const FavoritesPage = () => {
    const { loading, request } = useHttp();
    const userId = useContext(AuthContext).userId;
    const [favorites, setFavorites] = useState([]);

    const getFavorites = useCallback(async () => {
        try {
            const data = await request(`/api/favourites/${userId}/routes`);
            setFavorites(data);
            console.log(data);
        } catch (e) {
            toast.error(e.message);
        }
    }, [userId]);

    useEffect(() => {
        getFavorites();
    }, [getFavorites]);

    const likeTrip = async (routeId) => {
        try {
            const favourite = favorites.find(f => f.routeId._id === routeId);
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
    if (!favorites.length) return <div className="text-center text-2xl mt-10">У вас нет избранных поездок</div>;

    return (
        <div className='container'>
        {favorites.map(favorite => (
            <TravelCard
                key={favorite.routeId._id}
                trip={favorite.routeId}
                likeButtonHandler={() => likeTrip(favorite.routeId._id)}
                isFavorite={true}
            />
        ))}
        </div>
    );
};

