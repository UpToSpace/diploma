import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';

export const RouteBuilding = ({ stops, setSelectedTransport, showTransportRoute }) => {

    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [stopPoints, setStopPoints] = useState({ startStop: '', endStop: '' });
    const [options, setOptions] = useState([])

    useEffect(() => {
        if (stops) {
            const uniqueStops = Array.from(new Set(stops.map(type => type.name))).map(name => {
                return {
                    value: name,
                    label: name
                }
            })
            setOptions(uniqueStops);
        }
    }, [stops]);

    const getTransportByStops = async () => {
        if (stopPoints.startStop === '' || stopPoints.endStop === '') {
            toast('Запоўнiце пустыя палi');
            return;
        }
        if (stopPoints.startStop === stopPoints.endStop) {
            toast('Початковая і канчатковая спынкі не могуць быць аднолькавымі');
            return;
        }
        try {
            const data = await request('/api/transports/routes/stops?startStop=' + stopPoints.startStop + '&endStop=' + stopPoints.endStop, 'GET', null);
            setSelectedTransport(data);
            showTransportRoute(data, null);
            console.log(data);
        } catch (e) {
            toast(e.message);
        }
    }

    const handleChange = async (event) => {
        console.log(stopPoints)
        setStopPoints({ ...stopPoints, [event.target.name]: event.target.value.value });
    }

    return (
        <div className='chooseroute-form'>
            <button className="waves-effect waves-light btn-large" onClick={getTransportByStops}>Паказаць маршрут</button>
        </div>
    )
}