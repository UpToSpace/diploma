import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import moment from 'moment';

export const AdminStatisticsPage = () => {
    const { request, loading } = useHttp();
    const { userId } = useContext(AuthContext);
    const [statistics, setStatistics] = useState(null);

    const getData = useCallback(async () => {
        try {
            const data = await request(`/api/user/admin/statistics`, 'GET');
            console.log(data);
            setStatistics(data);
        } catch (e) {
            toast.error('Failed to fetch data');
            console.error(e);
        }
    }, [request]);

    useEffect(() => {
        getData();
    }, [getData]);

    const getMonthlyStatisticsOption = (usersData, carriersData) => {
        const months = Array.from(new Set([
            ...usersData.map(item => moment().month(item._id - 1).format('MMMM')),
            ...carriersData.map(item => moment().month(item._id - 1).format('MMMM'))
        ])).sort((a, b) => moment(a, 'MMMM').month() - moment(b, 'MMMM').month());

        const usersCounts = months.map(month =>
            (usersData.find(item => moment().month(item._id - 1).format('MMMM') === month)?.count || 0)
        );
        const carriersCounts = months.map(month =>
            (carriersData.find(item => moment().month(item._id - 1).format('MMMM') === month)?.count || 0)
        );

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', crossStyle: { color: '#999' } }
            },
            toolbox: {
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: { data: ['Users', 'Carriers'] },
            xAxis: [{ type: 'category', data: months, axisPointer: { type: 'shadow' } }],
            yAxis: [{ type: 'value', name: 'Count', axisLabel: { formatter: '{value}' } }],
            series: [
                {
                    name: 'Users',
                    type: 'bar',
                    data: usersCounts
                },
                {
                    name: 'Carriers',
                    type: 'bar',
                    data: carriersCounts
                }
            ]
        };
    };

    if (loading || !statistics) {
        return <Loader />;
    }

    return (
        <div>
            <ReactECharts option={getMonthlyStatisticsOption(statistics.usersByMonth, statistics.carriersByMonth)} style={{ height: 400 }} />
            <div className="flex justify-between w-full">
                <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                        </svg>
                    </div>
                    Количество пользователей
                    <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                        {statistics.usersCount}
                    </span>
                </div>
                <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                        </svg>
                    </div>
                    Количество перевозчиков
                    <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                        {statistics.carriersCount}
                    </span>
                </div>
                <div className="w-1/3 p-4 rounded-lg shadow-lg text-center mt-2 text-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                        </svg>
                    </div>
                    Общее число поездок
                    <span className="block mt-2 text-center text-gray-900 font-normal text-base">
                        {statistics.routesCount}
                    </span>
                </div>
            </div>
        </div>
    );
};
