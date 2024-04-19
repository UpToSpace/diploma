import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { MapWithRoutesLocations } from '../../components/MapComponents';

export const MapPage = () => {
    const { request, loading } = useHttp();
    const [locations, setLocations] = useState([]);

    const getLocations = useCallback(async () => {
        try {
            const data = await request('/api/routes/locations');
            console.log(data);
            setLocations(data);
        } catch (e) {
            console.log(e.message);
        }
    }, [request]);

    useEffect(() => {
        getLocations();
    }, [getLocations]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            {/* <MapWithRoutesLocations locations={locations} /> */}
        </>
    )
}