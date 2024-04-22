import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import { getMostVisitedCity } from '../../components/functions';

export const StatisticsPage = () => {
    const { id } = useParams();
    const { request, loading } = useHttp();
    const userId = useContext(AuthContext).userId;
    const [tripsData, setTripsData] = useState([]);

    const getData = useCallback(async () => {
        try {
            const data = await request(`/api/user/${userId}/statistics`, 'GET');
            console.log(data);
            setTripsData(data);
        } catch (e) {
            console.error(e);
        }
    }, [request, id]);

    useEffect(() => {
        getData();
    }, [getData]);

    const processData = (data) => {
        const stats = {};

        data.forEach(({ cost, purchaseDate }) => {
            const month = moment(purchaseDate).format('MMMM');
            if (!stats[month]) {
                stats[month] = { totalCost: 0, tripCount: 0 };
            }
            stats[month].totalCost += cost;
            stats[month].tripCount += 1;
        });

        return Object.keys(stats).map(month => ({
            month,
            totalCost: stats[month].totalCost,
            tripCount: stats[month].tripCount
        }));
    };

    const getOption = () => {
        const processedData = processData(tripsData);

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            toolbox: {
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                data: ['Money Spent', 'Number of Trips']
            },
            xAxis: [
                {
                    type: 'category',
                    data: processedData.map(item => item.month),
                    axisPointer: {
                        type: 'shadow'
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Money Spent',
                    min: 0,
                    max: Math.max(...processedData.map(item => item.totalCost)) + 50,
                    interval: 50,
                    axisLabel: {
                        formatter: '{value} BYN'
                    }
                },
                {
                    type: 'value',
                    name: 'Trips',
                    min: 0,
                    max: Math.max(...processedData.map(item => item.tripCount)) + 2,
                    interval: 1,
                    axisLabel: {
                        formatter: '{value} trips'
                    }
                }
            ],
            series: [
                {
                    name: 'Money Spent',
                    type: 'bar',
                    data: processedData.map(item => item.totalCost)
                },
                {
                    name: 'Number of Trips',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: processedData.map(item => item.tripCount)
                }
            ]
        };
    };

    if (loading) {
        return <Loader />;
    }

    if (!tripsData.length) {
        return <h1 className="text-center text-2xl mt-4">Для сбора статистики купите билеты</h1>;
    }

    return (
        <>
            <ReactECharts option={getOption()} style={{ height: 400 }} />
            <div className="flex justify-between w-full">
                <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                        </svg>
                    </div>
                    Количество поездок
                    <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                        {tripsData.length}
                    </span>
                </div>
                <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                        </svg>
                    </div>
                    Самый посещаемый город
                    <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                        {getMostVisitedCity(tripsData)}
                    </span>
                </div>
                <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                        </svg>
                    </div>
                    Потрачено денег
                    <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                        {tripsData.reduce((acc, trip) => acc + trip.cost, 0)} BYN
                    </span>
                </div>
            </div>
        </>
    );
}