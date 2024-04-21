import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { TravelCard } from '../../components/TravelCard';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import { Review } from '../../components/Review';
import { calculateRatingsData } from '../../components/functions';

export const CarrierPage = () => {
    const { id } = useParams();
    const [carrier, setCarrier] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsRatings, setReviewsRatings] = useState([]);
    const { loading, request } = useHttp();
    const userRole = useContext(AuthContext).userRole;

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
                label: `${key} star`,
                width: totalReviews > 0 ? `${(ratingCounts[key] / totalReviews * 100).toFixed(2)}%` : '0%'
            }));

            console.log(reviewsRatings);
            setReviewsRatings(reviewsRatings);
        } catch (e) {
            console.log(e);
        }
    }, [id, request]);

    useEffect(() => {
        getCarrier();
        getReviews();
    }, [getCarrier, getReviews]);

    if (loading || !carrier || !reviews) {
        return <Loader />;
    }

    return (
        <div>
            <div className="flex items-center mb-2">
                {Array(4).fill(
                    <svg className="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                )}
                <svg className="w-4 h-4 text-gray-300 me-1 dark:text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">{calculateRatingsData(reviews).averageRating}</p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">из</p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">5</p>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{calculateRatingsData(reviews).numberOfRatings} отзывов</p>
            {reviewsRatings.map(item => (
                <div className="flex items-center mt-4">
                    <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">{item.label}</a>
                    <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                        <div className="h-5 bg-yellow-300 rounded" style={{ width: item.width }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.width}</span>
                </div>
            ))}

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                {reviews.length !== 0 && reviews.map(review => (
                    <Review key={review._id} review={review} userRole={userRole} getReviews={getReviews} />
                ))}
            </div>
        </div>
    )
}
