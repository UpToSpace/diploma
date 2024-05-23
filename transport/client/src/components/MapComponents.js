import busIcon from "../styles/images/bus-icon.svg"
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import flagIcon from "../styles/images/flag.svg"
import blueflag from "../styles/images/blueflag.svg"
import redflagIcon from "../styles/images/redflag.svg"
import { Marker, Popup, Source } from 'react-map-gl';
import ReactMapGL, {
    FullscreenControl,
    GeolocateControl,
    Layer,
} from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { getDistance } from 'geolib';
import { useHttp } from '../hooks/http.hook';

const SECRET_TOKEN = "sk.eyJ1IjoidmFsZXJpZTE0My12YWxlcmllIiwiYSI6ImNsZ2tsaWVpMTBkdzQzZHFxOW53M2hoanAifQ.v_wnapRnZGiB1Xof48SmPw"
const CENTER = [27.567444, 53.893009];
const ZOOM = 11;

const geolocateControlStyle = {
    left: 10,
    top: 10,
};

const fullscreenControlStyle = {
    right: 10,
    top: 10,
};


const ROUTE_LAYER = {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
        'line-join': 'round',
        'line-cap': 'round',
    },
    paint: {
        'line-color': '#a3e339',
        'line-width': ZOOM * 0.4,
    },
};

const POINT_LAYER = {
    id: 'point',
    type: 'circle',
    source: 'route',
    paint: {
        'circle-radius': ZOOM * 0.7,
        'circle-color': '#f30',
    },
};


export const MiniMap = ({ longitude, latitude, updateCoordinates }) => {
    const [viewState, setViewState] = useState({
        latitude: latitude,
        longitude: longitude,
        zoom: ZOOM,
    });

    const fetchUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                updateCoordinates(latitude, longitude);
                setViewState(v => ({ ...v, latitude, longitude }));
                updateCoordinates(latitude, longitude);
            }, (error) => {
                console.error("Error fetching geolocation: ", error);
            }, {
                enableHighAccuracy: true
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        setViewState((oldViewport) => ({
            ...oldViewport,
            latitude,
            longitude,
        }));
    }, [latitude, longitude]);

    useEffect(() => {
        fetchUserLocation();
    }, []); // This effect runs once after the component mounts

    return <ReactMapGL
        style={{ width: "100%", height: "300px" }}
        {...viewState}
        mapboxAccessToken={process.env.REACT_APP_MAP_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(event) => {
            setViewState(event.viewState);
        }}
    >
        <Marker
            latitude={latitude}
            longitude={longitude}
        >
            <div className="marker">
                <img src={redflagIcon}
                    alt="marker"
                    height={ZOOM * 2 + "px"}
                    width={ZOOM * 2 + "px"} />
            </div>
        </Marker>
    </ReactMapGL>
};

export const Map = ({ points }) => {
    const { request } = useHttp();
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM,
    });

    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        console.log(points);
        if (points.length >= 2) {
            // Предполагается, что points - это массив объектов с координатами { latitude, longitude }
            const distance = getDistance(
                { latitude: points[0].latitude, longitude: points[0].longitude },
                { latitude: points[1].latitude, longitude: points[1].longitude }
            );

            // Приблизительный расчет зума на основе расстояния
            let zoom = 10;
            if (distance > 10000) {
                zoom = 8;
            } else if (distance > 5000) {
                zoom = 9;
            } else if (distance > 1000) {
                zoom = 11;
            } else if (distance > 500) {
                zoom = 12;
            } else {
                zoom = 13;
            }

            const centerLatitude = (points[0].latitude + points[1].latitude) / 2;
            const centerLongitude = (points[0].longitude + points[1].longitude) / 2;

            setViewState({
                latitude: centerLatitude,
                longitude: centerLongitude,
                zoom: zoom,
            });
        }
        getRoutes();
    }, [points]);

    const getRoutes = useCallback(async () => {
        try {
            const pointsToRequest = points.map(point => `${point.longitude},${point.latitude}`).join(';');
            const data = await request(`https://api.mapbox.com/directions/v5/mapbox/driving/${pointsToRequest}?` +
                `steps=true&geometries=geojson&access_token=${process.env.REACT_APP_MAP_TOKEN}&overview=full&annotations=distance,duration`)
            console.log(data);
            setRoutes(data.routes[0].geometry.coordinates);
        } catch (e) {
            console.log(e.message);
        }
    }, [points]);

    return (
        <ReactMapGL
            style={{ width: "100%", height: "100vh" }}
            {...viewState}
            mapboxAccessToken={process.env.REACT_APP_MAP_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            onMove={(event) => {
                setViewState(event.viewState);
            }}
        >
            <Source id="route" type="geojson" data={{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: routes,
                }
            }}>
                <Layer {...ROUTE_LAYER} />
            </Source>
            <Layer {...POINT_LAYER} />
            {/* {points.map((point, index) => (
                <Marker
                    latitude={point.latitude}
                    longitude={point.longitude}
                    key={index}
                >
                    <div className="marker">
                        <img src={redflagIcon}
                            alt="marker"
                            height={viewState.zoom * 2 + "px"}
                            width={viewState.zoom * 2 + "px"} />
                    </div>
                </Marker>
            ))} */}
        </ReactMapGL>
    );
}

export const MapWithRoutesLocations = ({ selectedDeparture, setSelectedDeparture, selectedDestination, setSelectedDestination }) => {
    const [routes, setRoutes] = useState([]);
    const [lineData, setLineData] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: 3,
    });

    const fetchRoutes = async () => {
        const response = await fetch('/api/routes/locations'); // Adjust API endpoint as necessary
        const data = await response.json();
        setRoutes(data);
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // Convert fetched routes to a set of unique departures
    const uniqueDepartures = Array.from(new Set(routes.map(route => ({
        latitude: route.departure.latitude,
        longitude: route.departure.longitude,
        country: route.departure.country,
        city: route.departure.city
    }))));

    // Filter destinations based on selected departure
    const destinations = routes.filter(route => route.departure.city === selectedDeparture?.city && route.departure.country === selectedDeparture?.country)
        .map(route => ({
            latitude: route.destination.latitude,
            longitude: route.destination.longitude,
            country: route.destination.country,
            city: route.destination.city
        }));

    // Handling clicks on departure markers
    const handleDepartureClick = (departure) => {
        console.log('Departure clicked', departure);
        console.log('Selected departure', selectedDeparture);
        if (selectedDeparture?.longitude === departure.longitude && selectedDeparture?.latitude === departure.latitude) {
            setSelectedDeparture(null);
            setSelectedDestination(null);
            setLineData(null);
            return;
        }
        setSelectedDeparture(departure);
        setSelectedDestination(null);
        setLineData(null);
    };

    // Handling clicks on destination markers
    const handleDestinationClick = (destination) => {
        console.log('Destination clicked', destination);
        console.log('Selected destination', selectedDestination);
        if (!selectedDeparture) {
            return;
        }
        if (selectedDestination?.longitude === destination.longitude && selectedDestination?.latitude === destination.latitude) {
            setSelectedDestination(null);
            setLineData(null);
            return;
        }
        setSelectedDestination(destination);
        if (selectedDeparture) {
            setLineData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [selectedDeparture.longitude, selectedDeparture.latitude],
                        [destination.longitude, destination.latitude]
                    ]
                }
            });
        }
    };

    // Map and markers setup
    return (
        <ReactMapGL
            {...viewState}
            style={{ width: "100%", height: "100%" }}
            mapboxAccessToken={process.env.REACT_APP_MAP_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            onMove={(event) => {
                setViewState(event.viewState);
            }}
            onLoad={(e) => {
                const layers = e.target.getStyle().layers;

                layers.forEach((layer) => {
                    if (layer.type === 'symbol' && layer.layout['text-field']) {
                        e.target.setLayoutProperty(layer.id, 'text-field', [
                            'get',
                            `name_${'ru'}`
                        ]);
                    }
                });
            }
            }
        >
            {!selectedDeparture && uniqueDepartures.map((point, index) => (
                <Marker
                    latitude={point.latitude}
                    longitude={point.longitude}
                    key={index}
                    onClick={() => handleDepartureClick(point)}
                />
            ))}

            {selectedDeparture && (!selectedDestination ? destinations.map((point, index) => (
                <Marker
                    latitude={point.latitude}
                    longitude={point.longitude}
                    key={index}
                    onClick={() => handleDestinationClick(point)}
                />
            )) :
                <Marker
                    latitude={selectedDestination.latitude}
                    longitude={selectedDestination.longitude}
                    onClick={() => handleDestinationClick(selectedDestination)}
                    color='green'
                />
            )}

            {selectedDeparture && (
                <Marker
                    latitude={selectedDeparture.latitude}
                    longitude={selectedDeparture.longitude}
                    color='red'
                    onClick={() => handleDepartureClick(selectedDeparture)}
                />
            )}

            {lineData && (
                <Source id="route" type="geojson" data={lineData}>
                    <Layer type="line" layout={{ 'line-cap': 'round', 'line-join': 'round' }} paint={{ 'line-color': '#888', 'line-width': 8 }} />
                </Source>
            )}
        </ReactMapGL>
    );
};