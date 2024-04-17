import { useEffect, useState, useCallback, useContext } from 'react';
import { Loader } from '../../components/Loader';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useParams } from 'react-router-dom';
import moment from 'moment';

export const TimetablePage = () => {
    const { id } = useParams();
    const { request, loading } = useHttp();
    const userId = useContext(AuthContext).userId;

    if (loading) {
        return <Loader />;
    }

    return (
        <>
        </>
    )
}