import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CityAutocomplete } from '../../components/AutoCompleteInput';
import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook';
import { MapWithRoutesLocations } from '../../components/MapComponents';
import { SearchIcon } from '@heroicons/react/solid';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const MapPage = () => {
    const [lineData, setLineData] = useState(null);
    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const navigate = useNavigate();
    const { request, loading } = useHttp();

    const search = () => {
        if (!selectedDeparture || !selectedDestination) {
            toast.error('Пожалуйста, выберите пункт отправления и пункт назначения.');
            return;
        }
        try {
            const searchParams = new URLSearchParams({
                departure: `${selectedDeparture.city},${selectedDeparture.country}`,
                destination: `${selectedDestination.city},${selectedDestination.country}`,
                numberOfSeats: 1,
                conditioners: false,
                wifi: false,
                power: false,
            });
            navigate(`/search?${searchParams}`);
        } catch (e) {
            toast.error(e.message);
        }
    };
    return (
        <div className='container'>
            <div className="relative z-20 max-w-3xl mx-auto p-4 rounded-lg bg-white text-primary shadow-lg w-full grid grid-cols-3 gap-2">
                <input type="text"
                    value={selectedDeparture ? `${selectedDeparture.city}, ${selectedDeparture.country}` : ''}
                    label="Departure"
                    placeholder="Выберите пункт отправления"
                    readOnly={true}
                />
                <input type="text"
                    value={selectedDestination ? `${selectedDestination.city}, ${selectedDestination.country}` : ''}
                    label="Destination"
                    placeholder="Выберите пункт назначения"
                    readOnly={true}
                />
                <div className='flex'>
                    <button className="primary bg-primary text-white text-lg rounded-lg p-2 inline-flex items-center justify-center" onClick={search}>
                        <SearchIcon
                            className="icon-small text-white rounded-lg mx-1 h-5 w-5"
                            onClick={search}
                        />
                        Найти рейсы
                    </button>
                </div>
            </div>
            <div className='absolute inset-0 left-0 right-0 m-auto bg-center z-0 max-w-7xl h-full rounded'>
                <MapWithRoutesLocations
                    lineData={lineData}
                    setSelectedDeparture={setSelectedDeparture}
                    setSelectedDestination={setSelectedDestination}
                    selectedDeparture={selectedDeparture}
                    selectedDestination={selectedDestination}
                />
            </div>
        </div>
    );
};
