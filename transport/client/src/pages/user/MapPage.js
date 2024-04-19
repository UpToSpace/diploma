import { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Source, Layer } from 'react-map-gl';
import { CityAutocomplete } from '../../components/AutoCompleteInput';
import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook';
import { MapWithRoutesLocations } from '../../components/MapComponents';

export const MapPage = () => {
    const [lineData, setLineData] = useState(null);
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);


    // const handleSetDestination = (suggestion) => {
    //     setDestination(suggestion);
    //     // Draw line between departure and destination
    //     if (departure) {
    //         setLineData({
    //             type: 'Feature',
    //             properties: {},
    //             geometry: {
    //                 type: 'LineString',
    //                 coordinates: [
    //                     [departure.center[0], departure.center[1]],
    //                     [suggestion.center[0], suggestion.center[1]]
    //                 ]
    //             }
    //         });
    //     }
    // };

    return (
        <div>
            <input type="text" 
                value={selectedDeparture ? `${selectedDeparture.city}, ${selectedDeparture.country}` : ''}
                label="Departure"
                placeholder="Select departure"
                readOnly={true}
            />
            <input type="text"
                value={selectedDestination ? `${selectedDestination.city}, ${selectedDestination.country}` : ''}
                label="Destination"
                placeholder="Select destination"
                readOnly={true}
            />
            <MapWithRoutesLocations
                lineData={lineData}
                setSelectedDeparture={setSelectedDeparture}
                setSelectedDestination={setSelectedDestination}
                selectedDeparture={selectedDeparture}
                selectedDestination={selectedDestination}
            />
        </div>
    );
};
