import React from 'react';
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Package, DollarSign, BarChart2, ShoppingCart, AlertTriangle } from 'lucide-react';

// Product image mapping object - maps product names to image URLs
const productImages = {
  "Gold Jari Single White Dhothy - 2.004": "https://www.mrlungi.com/wp-content/uploads/2022/05/Single-2-meter-gold-jari-dhotis-set.jpg",
  "Gold Jari Single Cream Dhothy - 2.00": "https://rukminim2.flixcart.com/image/850/1000/xif0q/dhoti/k/6/7/free-wd212-earthen-fine-crafts-original-imaghxwywxgm8zxv.jpeg?q=20&crop=false",
  "Cotton Gold Tissue Single Dhothy 2007": "https://naachiyars.in/cdn/shop/files/N1944704-A_4_1024x.jpg?v=1742045505",
  "Cotton Copper Tissue Single Dhothy - 25.00": "https://m.media-amazon.com/images/I/61Ll0yWtxUL._AC_UY1100_.jpg",
  "Cotton Sea Green Dhothy Single": "https://5.imimg.com/data5/SELLER/Default/2024/10/455695307/CP/TR/CA/188366288/e315a62e-1461-4dee-b9fc-90a3c3d6a971-500x500.jpeg",
  "Good Jard Double White Dhothy": "https://rhythmdhotis.com/wp-content/uploads/2024/01/fancy-red-border-double-dhoti.jpg",
  "Gold Dand Double Dhothy": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOcdub-U2nMkTLAhw2XiaF8u-Kw7L0eAS99g&s",
  "Cream Dhothy": "https://uathayam.in/cdn/shop/files/DURGAMBHA_9x5_Cream.jpg?v=1741867202",
  "Sahha Low Single White Dhothy": "https://www.mrlungi.com/wp-content/uploads/2022/05/Single-Dhoti-with-small-color-borders.jpg",
  "White Heley Single Fancy White Dhothy": "https://mcrshopping.com/cdn/shop/files/AKRL6167_e1ab6ba1-d4c7-4360-87f3-2683c864b5fb.jpg?v=1727343005",
  "Double Roney White Dhothy": "https://m.media-amazon.com/images/I/61hgs0Ne+kL._AC_UY1100_.jpg",
  "Cotton White Heley Single": "https://cottonfolk.in/cdn/shop/products/5_600x.jpg?v=1703667101",
  "Double Cotton White Dhothy": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvapxmuIQ6c51EAcaLIj6ZvPUl8zqoJq2rGw&s",
  "Gold Jari White Angavastram": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsSG_kf_298f_8OULm-Xy6i_CcHQ7uJr3toQ&s",
  "Gold Saw Cream Angavastram": "https://www.ministerwhite.com/cdn/shop/files/IMG_0125.png?v=1724396477",
};

// Default image in case product name doesn't match
const defaultProductImage = "https://m.media-amazon.com/images/I/71zZLM+-p3L._SL1500_.jpg";

const ProductCard = ({ product, onEdit, onDelete, role }) => {
  const navigate = useNavigate();
  const isLowStock = product.stock < 10;
  const totalValue = (product.stock * product.price).toFixed(2);
  
  // Get product image based on product name
  const productImage = productImages[product.name] || defaultProductImage;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="relative">
        {/* Product Image */}
        <img 
          src={productImage} 
          alt={product.name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = defaultProductImage;
          }}
        />
        
        {/* Stock Indicator Badge */}
        {isLowStock && (
          <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <AlertTriangle size={12} className="mr-1" />
            Low Stock
          </div>
        )}
      </div>

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
            <span className="ml-2">${totalValue}</span>
          </div>
        </div>

        {/* Only show Sell button if user is admin */}
        {role === 'admin' && (
          <button
            onClick={() =>
              navigate(`/sell-product/${product._id}`, {
                state: {
                  id: product._id,
                  name: product.name,
                  stock: product.stock,
                  price: product.price,
                  imageUrl: productImage
                },
              })
            }
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <ShoppingCart size={18} className="mr-2" />
            Sell Product
          </button>
        )}
      </div>

      {/* Only show Edit/Delete if user is admin */}
      {role === 'admin' && (
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
      )}
    </div>
  );
};

export default ProductCard;