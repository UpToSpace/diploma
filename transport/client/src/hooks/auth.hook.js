import { useState, useCallback, useEffect } from "react";
import { useHttp } from "./http.hook";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [ready, setReady] = useState(false);
    const [userRole, setUserRole] = useState(undefined);
    const [userLocation, setUserLocation] = useState(null);
    const { request } = useHttp();

    const login = useCallback((jwtToken, user) => {
        setToken(jwtToken);
        setUserId(user._id)
        setUserRole(user.role);
        localStorage.setItem('token', jwtToken);
    }, []);

    const logout = useCallback(async () => {
        const data = await request('/api/auth/logout', 'POST', null);
        setToken(null);
        setUserId(null);
        setUserRole(null)
        localStorage.removeItem('token');
    }, []);

    const getUserRole = useCallback(async (token) => {
        try {
            const data = await request('/api/auth/userrole');
            //console.log('auth.hook.js: getUserRole: data.role = ', data.role)
            setUserId(data.id);
            setUserRole(data.role);
        } catch (e) {
            console.log('auth.hook.js: getUserRole: e.message = ', e.message)
            setUserRole(null)
        }
    }, [userRole, userId]);

    const getUserLocation = useCallback(async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Use a reverse geocoding service to get the city name
                const city = await getCityName(latitude, longitude);

                if (city) {
                    const storedCity = localStorage.getItem('userCity');

                    // Check if the city has changed
                    if (storedCity !== city) {
                        const userConfirmed = window.confirm(`Your location is ${city}. Is this correct?`);
                        if (userConfirmed) {
                            localStorage.setItem('userCity', city);
                            setUserLocation(city);
                        } else {
                            window.alert('Please allow the browser to access your location');
                        }
                    } else {
                    }
                }
            });
        } else {
        }
    }, [getCityName, localStorage, window, navigator.geolocation]);



    async function getCityName(lat, lon) {
        const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ru`);
        const data = await response.json();
        return data.city || data.locality || data.principalSubdivision;
    }

    useEffect(() => {
        const data = localStorage.getItem('token');
        if (data) {
            getUserRole();
        } else {
            setUserRole(null)
        }
        getUserLocation();
        setReady(true)
    }, [getUserRole]);

    return { login, logout, ready, userRole, userId, userLocation };
}