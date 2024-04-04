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