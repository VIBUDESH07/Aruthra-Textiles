import { motion } from "framer-motion";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03, boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between relative"
    >
      {/* Product Name */}
      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>

      {/* Stock & Price Section */}
      <div className="mt-2 text-gray-600">
        <p>
          Stock: <span className="font-medium">{product.stock}</span>
          {product.stock < 10 && (
            <span className="ml-2 text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Low Stock
            </span>
          )}
        </p>
        <p className="mt-1 text-lg font-semibold text-green-600">₹{product.price}</p>
        
        {/* Sell Button with State */}
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
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg mt-2"
        >
          Sell
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onEdit(product)}
          className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition duration-300"
        >
          <PencilSquareIcon className="w-5 h-5 mr-2" />
          Edit
        </button>
        <button
          onClick={() => onDelete(product._id)}
          className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}
