// src/components/ProductCard.tsx
import React from 'react';

interface ProductCardProps {
    name: string;
    weight: string;
    price: string;
    imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, weight, price, imageUrl }) => {
    return (
        <div className="p-4 border rounded-lg shadow-md">
            <img src={imageUrl} alt={name} className="w-24 h-24 mx-auto mb-4 rounded-md" />
            <h3 className="text-lg font-semibold text-center">{name}</h3>
            <p className="text-center text-gray-500">{weight}</p>
            <p className="text-center text-lg font-bold mt-2">${price}</p>
            <button className="flex items-center justify-center w-10 h-10 mx-auto mt-4 text-white bg-gray-200 rounded-full">
                <span className="text-xl text-gray-800">+</span>
            </button>
        </div>
    );
};

export default ProductCard;
