import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Search } from "lucide-react";

const masterProductList = [
  "Gold Jari Single White Dhothy - 2.004",
  "Gold Jari Single Cream Dhothy - 2.00",
  "Cotton Gold Tissue Single Dhothy 2007",
  "Cotton Copper Tissue Single Dhothy - 25.00",
  "Cotton Sea Green Dhothy Single",
  "Gold Jari Double White Dhothy",
  "Gold Jari Double Dhothy",
  "Cream Dhothy",
  "Sahha Low Single White Dhothy",
  "Patta Jari Single Dhothy Only",
  "Double Fancy White Dhothy",
  "Cotton White Fancy Single",
  "Double Cotton White Dhothy",
  "Gold Jari White Angavastram",
  "Gold Jari Cream Angavastram",
];

const backendURL = process.env.REACT_APP_BACKEND_URL;

const Product = () => {
  const [productData, setProductData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get(`${backendURL}/api/products`)
      .then((res) => {
        const backendProducts = res.data;
        const productMap = {};
        backendProducts.forEach((p) => {
          productMap[p.name] = p.count;
        });

        const finalProducts = masterProductList.map((name) => ({
          name,
          count: productMap[name] || 0,
        }));

        setProductData(finalProducts);
        setFilteredProducts(finalProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const filtered = productData.filter((product) =>
      product.name.toLowerCase().includes(keyword)
    );
    setFilteredProducts(filtered);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-gray-600 font-medium">Loading products...</span>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
        📦 Product Stock Overview
      </h1>

      <div className="mb-6 flex items-center gap-2">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search products..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200 transition hover:shadow-lg"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h2>
              <p
                className={`text-3xl font-bold ${
                  product.count > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.count > 0 ? `🟢 ${product.count}` : "🔴 0"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {product.count > 0 ? "Available in stock" : "Out of stock"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Product;
