import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { MAP_TOKEN } from "./MapComponents";
import { set } from 'mongoose';

AutoCompleteInput.propTypes = {
    handleManualInputChange: PropTypes.func.isRequired,
    setPlace: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
};

export function AutoCompleteInput({
    handleManualInputChange,
    setPlace,
    name,
    place
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [streetAndNumber, setStreetAndNumber] = useState("");

    useEffect(() => {
        setStreetAndNumber(place?.place || "");
    }, [place]); 
    
    const handleChange = (event) => {
        handleManualInputChange(event, name);
        handleInputChange(event.target.value);
        setStreetAndNumber(event.target.value);
    };

    const handleInputChange = async (query) => {
        const suggesions = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAP_TOKEN}&place_type=address&language=ru`)
            .then((response) => response.json())
            .then((data) => data.features)
            .then((features) => features.filter((feature) => feature.place_type.includes("address")))
            .then((features) => features.slice(0, 5));
        setSuggestions(suggesions);
    };

    const handleSuggestionClick = (suggestion) => {
        //const streetAndNumber = suggestion.place_name.split(",")[0];
        const latitude = suggestion.center[1];
        const longitude = suggestion.center[0];

        const address = {
            place: suggestion.place_name,
            city: suggestion.context.find((context) => context.id.includes("place")).text,
            country: suggestion.context.find((context) => context.id.includes("country")).text,
            latitude,
            longitude,
        };

        console.log(suggestion);
        console.log(address);
        // Directly update the parent form state with the new address
        setPlace(prevForm => ({
            ...prevForm,
            [name]: address, // Use the name prop to dynamically set the key
        }));
        setSuggestions([]);
        setStreetAndNumber(suggestion.place_name);
    };

    return (
        <div>
            <div className="autoCompleteInputContainer">
                <input
                    id="address"
                    type="text"
                    placeholder="Address"
                    value={streetAndNumber}
                    onChange={handleChange}
                    name="streetAndNumber"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                />
                <ul className="addressSuggestions">
                    {suggestions?.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion.place_name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}