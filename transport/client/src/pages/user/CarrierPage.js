import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { TravelCard } from '../../components/TravelCard';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import { Review } from '../../components/Review';
import { calculateRatingsData, convertDate } from '../../components/functions';

export const CarrierPage = () => {
    const { id } = useParams();
    const [carrier, setCarrier] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [reviewsRatings, setReviewsRatings] = useState([]);
    const { loading, request } = useHttp();
    const userRole = useContext(AuthContext).userRole;
    const userId = useContext(AuthContext).userId;

    const getCarrier = useCallback(async () => {
        try {
            const data = await request(`/api/user/carriers/${id}`);
            setCarrier(data);
        } catch (e) {
            toast.error('Error loading carrier');
            console.log(e);
        }
    }, [id, request]);

    const getReviews = useCallback(async () => {
        try {
            const data = await request(`/api/reviews/carriers/${id}`);
            setReviews(data);
            setFilteredReviews(data);
            const totalReviews = data.length;
            const ratingCounts = {
                '1': 0,
                '2': 0,
                '3': 0,
                '4': 0,
                '5': 0
            };

            data.forEach(review => {
                const ratingKey = String(review.rating); // Ensure the key is a string
                if (ratingKey in ratingCounts) {
                    ratingCounts[ratingKey]++;
                }
            });

            const reviewsRatings = Object.keys(ratingCounts).map(key => ({
                label: `${key} звезд`,
                width: totalReviews > 0 ? `${(ratingCounts[key] / totalReviews * 100).toFixed(2)}%` : '0%'
            }));

            console.log(reviewsRatings);
            setReviewsRatings(reviewsRatings);
        } catch (e) {
            console.log(e);
        }
    }, [id, request]);

    const showOnlyStars = (stars) => {
        if (!stars) {
            setFilteredReviews(reviews);
            return;
        }
        const filteredReviews = reviews.filter(review => review.rating === Number(stars));
        setFilteredReviews(filteredReviews);
    };

    useEffect(() => {
        getCarrier();
        getReviews();
    }, [getCarrier, getReviews]);

    if (loading || !carrier || !reviews) {
        return <Loader />;
    }

    return (
        <div className='container'>
            <div className="max-w-full mx-auto p-6 mb-3">
                <h2 className="section">Информация о перевозчике</h2>
                <div className="mt-4 grid grid-cols-3 w-5/6"> 
                    <img className='avatar' src={carrier.avatarUrl} alt={carrier.fullName} />
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Электронная почта:</span>
                            <span className="text-gray-600">{carrier.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Активность:</span>
                            {carrier.activatedAsCarrier ? <span className="text-green-950">Активен</span> : <span className="text-red-950">Не активен</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Имя:</span>
                            <span className="text-gray-600">{carrier.fullName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Дата рождения:</span>
                            <span className="text-gray-600">{convertDate(carrier.dateOfBirth)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Дата регистрации:</span>
                            <span className="text-gray-600">{convertDate(carrier.dateOfRegistration)}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center mb-2">
                            {Array(Math.round(Number(calculateRatingsData(reviews).averageRating))).fill(
                                <svg className="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" fill="currentColor" viewBox="0 0 22 20">
                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                </svg>
                            )}
                            {Array(5 - Math.round(Number(calculateRatingsData(reviews).averageRating))).fill(
                            <svg className="w-4 h-4 text-gray-300 me-1 dark:text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 22 20">
                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                            </svg>
                            )}
                            <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">{calculateRatingsData(reviews).averageRating}</p>
                            <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">из</p>
                            <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">5</p>
                        </div>
                        <button className="text-sm font-medium text-blue-600 hover:underline" onClick={e => showOnlyStars()}>Все {calculateRatingsData(reviews).numberOfRatings} отзывов</button>
                        {reviewsRatings.map(item => (
                            <div className="flex items-center mt-4 w-full">
                                <button className="text-sm font-medium text-blue-600 hover:underline" onClick={e => showOnlyStars(item.label.split(' ')[0])}>{item.label}</button>
                                <div className="w-3/5 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                    <div className="h-5 bg-yellow-300 rounded" style={{ width: item.width }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.width}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            


            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                {reviews.length !== 0 && filteredReviews.map(review => (
                    <Review 
                    key={review._id} 
                    review={review} 
                    userRole={userRole} 
                    getReviews={getReviews}
                    editButtonEnable={review.user._id === userId} />
                ))}
            </div>
        </div>
    )
}
