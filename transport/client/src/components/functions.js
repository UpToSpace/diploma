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

export const calculateTimeDifference = (startDate, endDate) => {
    const startDateTime = new Date(startDate.substring(0, 10) + 'T' + startDate.substring(11, 16));
    const endDateTime = new Date(endDate.substring(0, 10) + 'T' + endDate.substring(11, 16));
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

export const checkIfTicketOver = (date) => {
    const ticketDateTime = new Date(date);
    const currentDateTime = new Date();

    return ticketDateTime < currentDateTime; // change to < 
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

export const convertDate = (isoDateString) => {
    const date = new Date(isoDateString);

    // Extract day, month, and year from the date object
    const day = String(date.getDate()).padStart(2, '0');  // Ensure day is two digits
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Month is 0-indexed, so add 1
    const year = date.getFullYear();

    // Combine in desired format
    return `${day}.${month}.${year}`;
}

export const convertTime = (isoDateString) => {
    const date = new Date(isoDateString);

    // Extract hours and minutes from the date object
    const hours = String(date.getHours()).padStart(2, '0');  // Ensure hours is two digits
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Ensure minutes is two digits

    // Combine in desired format
    return `${hours}:${minutes}`;
}

export function calculateRatingsData(data) {
    const totalReviews = data.length;
    let totalRatingSum = 0;

    data.forEach(review => {
        totalRatingSum += review.rating; // Summing up all the ratings
    });

    const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(2) : 0;

    return {
        averageRating: averageRating, // The average rating value
        numberOfRatings: totalReviews // Total number of reviews/ratings
    };
}