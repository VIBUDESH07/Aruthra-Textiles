import React from 'react';
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Package, DollarSign, BarChart2, ShoppingCart, AlertTriangle } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const isLowStock = product.stock < 10;
  
  // Calculate value
  const totalValue = (product.stock * product.price).toFixed(2);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            ID: {product._id.substring(0, 6)}...
          </span>
        </div>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-center text-gray-700">
            <Package size={18} className="mr-2 text-blue-500" />
            <span className="font-medium">Stock:</span>
            <div className="ml-2 flex items-center">
              <span>{product.stock} units</span>
              {isLowStock && (
                <div className="ml-2 flex items-center text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-xs">
                  <AlertTriangle size={12} className="mr-1" />
                  Low Stock
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <DollarSign size={18} className="mr-2 text-green-500" />
            <span className="font-medium">Price:</span>
            <span className="ml-2">${parseFloat(product.price.toString()).toFixed(2)}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <BarChart2 size={18} className="mr-2 text-purple-500" />
            <span className="font-medium">Value:</span>
            <span className="ml-2">{totalValue}</span>
          </div>
        </div>
        
        {/* Sell Button */}
        <button
          onClick={() =>
            navigate(`/sell-product/${product._id}`, {
              state: {
                id: product._id,
                name: product.name,
                stock: product.stock,
                price: product.price,
              },
            })
          }
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <ShoppingCart size={18} className="mr-2" />
          Sell Product
        </button>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between">
        <button 
          onClick={() => onEdit(product)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Edit size={16} className="mr-1" />
          Edit
        </button>
        <button 
          onClick={() => onDelete(product._id)}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors"
        >
          <Trash2 size={16} className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;