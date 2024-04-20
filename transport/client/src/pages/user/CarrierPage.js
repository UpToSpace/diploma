import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { TravelCard } from '../../components/TravelCard';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';

export const CarrierPage = () => {
    const { id } = useParams();
    const [carrier, setCarrier] = useState(null);
    const [reviews, setReviews] = useState([]);
    const { loading, request } = useHttp();

    const getCarrier = useCallback(async () => {
        try {
            const data = await request(`/api/carriers/${id}`);
            setCarrier(data);
        } catch (e) {
            navigate('/404');
        }
    }, [id, request, navigate]);

    const getReviews = useCallback(async () => {
        try {
            const data = await request(`/api/carriers/${id}/reviews`);
            setReviews(data);
        } catch (e) {
            console.log(e);
        }
    }, [id, request, navigate]);

    useEffect(() => {
        getCarrier();
    }, [getCarrier]);


