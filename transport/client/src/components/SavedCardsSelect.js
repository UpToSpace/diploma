import React from 'react';

export const SavedCardsSelect = ({ savedCards, onSelectCard }) => {
    return (
        <div>
            <label htmlFor="saved-cards" className="block text-sm font-medium text-gray-700">
                Сохраненные карты
            </label>
            <select
                id="saved-cards"
                name="saved-cards"
                onChange={(e) => onSelectCard(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                {savedCards.map((card, index) => (
                    <option key={index} value={card._id}>
                        **** **** **** {card.last4}
                    </option>
                ))}
            </select>
        </div>
    );
}

