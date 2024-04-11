import React from 'react';

export const SavedCardsSelect = ({ savedCards, onSelectCard }) => {
    return (
        <div className="w-full max-w-xs mx-auto">
            <label htmlFor="saved-cards" className="block text-sm font-medium text-gray-700">
                Your saved cards
            </label>
            <select
                id="saved-cards"
                name="saved-cards"
                onChange={(e) => onSelectCard(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="">Select a card</option>
                {savedCards.map((card, index) => (
                    <option key={index} value={card.cardToken}>
                        **** **** **** {card.cardNumber}
                    </option>
                ))}
            </select>
        </div>
    );
}

