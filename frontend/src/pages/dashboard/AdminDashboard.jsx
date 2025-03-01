import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import ProductCard from "../../components/ProductCard"; // Import the new component

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility

  const API_BASE_URL = "http://localhost:5000/api/materials";
  const token = localStorage.getItem("token");

  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Error fetching products");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Unauthorized: No User ID found.");
      return;
    }

    const product = { name, stock, price, createdBy: userId };

    try {
      const res = await fetch(`${API_BASE_URL}${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!res.ok) throw new Error("Failed to save product");
      toast.success(`Product ${editingId ? "updated" : "added"} successfully`);
      fetchProducts();
      setName("");
      setStock("");
      setPrice("");
      setEditingId(null);
      setShowForm(false); // Hide form after submission
    } catch (error) {
      toast.error("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Add Product Button */}
      {!showForm && (
        <div className="text-center mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Add Product
          </button>
        </div>
      )}

      {/* Form Section (Shown Only When Needed) */}
      {showForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                {editingId ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setName("");
                  setStock("");
                  setPrice("");
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 text-center">Product List</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={(p) => {
              setEditingId(p._id);
              setName(p.name);
              setStock(p.stock);
              setPrice(p.price);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
