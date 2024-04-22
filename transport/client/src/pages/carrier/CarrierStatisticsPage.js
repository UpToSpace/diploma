import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import { getMostVisitedCity } from '../../components/functions';

export const CarrierStatisticsPage = () => {
    const { request, loading } = useHttp();
    const userId = useContext(AuthContext).userId;
    const [tripsData, setTripsData] = useState({
        ticketsNumber: 0,
        routesNumber: 0,
        cash: 0,
        ticketsByMonth: []
    });

    const getData = useCallback(async () => {
        try {
            const data = await request(`/api/user/carrier/${userId}/statistics`, 'GET');
            console.log(data);
            setTripsData(data);
        } catch (e) {
            console.error(e);
        }
    }, [request, userId]);

    useEffect(() => {
        getData();
    }, [getData]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const option = {
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
            data: ['Ticket Count', 'Total Cost']
        },
        xAxis: [
            {
                type: 'category',
                data: tripsData.ticketsByMonth.map(item => months[item._id - 1]),
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Ticket Count',
                min: 0,
                interval: 1,
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: 'Total Cost',
                axisLabel: {
                    formatter: '${value}'
                }
            }
        ],
        series: [
            {
                name: 'Ticket Count',
                type: 'bar',
                data: tripsData.ticketsByMonth.map(item => item.count)
            },
            {
                name: 'Total Cost',
                type: 'line',
                yAxisIndex: 1,
                data: tripsData.ticketsByMonth.map(item => item.totalCost)
            }
        ]
    };

    if (loading) {
        return <Loader />;
    }

    return (
            tripsData.ticketsByMonth.length !== 0 ? <>
                <ReactECharts option={option} style={{ height: 400 }} key={JSON.stringify(tripsData.ticketsByMonth)} />
                <div className="flex justify-between w-full">
                    <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                            </svg>
                        </div>
                        Продано билетов
                        <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                            {tripsData.ticketsNumber}
                        </span>
                    </div>
                    <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                            </svg>
                        </div>
                        Осуществлено маршрутов
                        <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                            {tripsData.routesNumber}
                        </span>
                    </div>
                    <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                            </svg>
                        </div>
                        Заработано денег
                        <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                            {tripsData.cash.reduce((a, b) => a.cost + b.cost)} BYN
                        </span>
                    </div>
                </div>
            </> :
            <div className="flex justify-center items-center h-96">
                <p className="text-2xl">Для статистики необходимо добавить поездок и чтобы у вас купили билеты!</p>
            </div>
    );
}