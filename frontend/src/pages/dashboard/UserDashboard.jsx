import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";

export default function UserDashboard() {
  const [products, setProducts] = useState([]);
  
  const API_BASE_URL =  process.env.REACT_APP_BACKEND_URL;

  // Example usage with axios
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">User Dashboard</h1>
      
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 text-center">Product List</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} showContact={true} />
        ))}
      </div>
    </div>
  );
}
