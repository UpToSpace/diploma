// write a procedure that takes an array of bjects contains arrivalTime field like "19:00" and returns the closest time to current time and the next time

export const renderSeatLayout = (transport) => {
    //console.log(transport.seatsLayout)
    return transport.seatsLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2 my-2">
            {row.map((seat, seatIndex) => (
                <div key={seatIndex} className="w-8 h-8 bg-blue-200 text-center leading-8 rounded">
                    {seat}
                </div>
            ))}
        </div>
    ));
};

const parseDateTime = (date, time) => {
    return new Date(`${date}T${time}`);
};

export const calculateTimeDifference = (startDate, startTime, endDate, endTime) => {
    const startDateTime = parseDateTime(startDate, startTime);
    const endDateTime = parseDateTime(endDate, endTime);
    const differenceInMilliseconds = endDateTime - startDateTime;

    // Convert milliseconds to a readable format
    let minutes = Math.floor((differenceInMilliseconds / (1000 * 60)) % 60);
    let hours = Math.floor((differenceInMilliseconds / (1000 * 60 * 60)) % 24);
    const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    if (hours < 10) {
        hours = `0${hours}`;
    }

    if (days === 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${days}d ${hours}h ${minutes}m`;
};

export const checkIfTicketOver = (date, time) => {
    const ticketDateTime = parseDateTime(date, time);
    const currentDateTime = new Date();

    return ticketDateTime > currentDateTime; // change to < to test
}

export const getMostVisitedCity = (tripsData) => {
    const cities = tripsData.flatMap(trip => [trip.route.destination.city]); // add trip.route.departure.city to include origin cities

    // Step 2: Count each city's frequency
    const cityCounts = cities.reduce((acc, city) => {
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    // Step 3: Find the city that appears the most
    const mostFrequentCity = Object.keys(cityCounts).reduce((a, b) => cityCounts[a] > cityCounts[b] ? a : b);
    return mostFrequentCity;
}
