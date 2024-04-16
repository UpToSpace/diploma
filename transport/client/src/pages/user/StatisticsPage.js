import { useEffect, useState } from 'react';
import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';

export const StatisticsPage = () => {
    const { id } = useParams();
    const { request, loading } = useHttp();
}