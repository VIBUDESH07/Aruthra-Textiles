import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  X,
  Save,
  ArrowLeft,
  Layers,
  ShoppingBag
} from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { Phone } from "lucide-react";


export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  let userId = null;
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
      role = decoded.role; // Extract role from token
      console.log(backendURL);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendURL}/api/materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      setIsLoading(false);
    } catch (error) {
      toast.error("Error fetching products");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Unauthorized: No User ID found.");
      return;
    }

    const product = {
      name,
      stock: parseInt(stock, 10),
      price: parseFloat(price),
      createdBy: userId
    };

    setIsLoading(true);
    try {
      const res = await fetch(`${backendURL}/api/materials${editingId ? `/${editingId}` : ""}`, {
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
      resetForm();
      setIsLoading(false);
    } catch (error) {
      toast.error("Error saving product");
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setIsLoading(true);
      try {
        const res = await fetch(`${backendURL}/api/materials/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete product");
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error("Error deleting product");
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setStock("");
    setPrice("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchProducts}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
              title="Refresh Products"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {/* Show add button only for admin */}
            {role === "admin" && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
              >
                <Plus className="h-5 w-5 mr-1" />
                Add Product
              </button>
            )}
              {role === "user" && (
          <div className="flex justify-center ">
            <a
              href="tel:9994357571"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-300"
            >
              <Phone className="h-5 w-5 mr-2" />
              Contact: 99943 57571
            </a>
          </div>
        )}
          </div>
           {/* Contact button for user role */}
      
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Form Section (only visible to admin) */}
        {role === "admin" && showForm && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-8 max-w-2xl mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <select
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="" disabled>Select a product</option>
                  <option value="Gold Jani Single White Dhothy - 2.004">Gold Jani Single White Dhothy - 2.004</option>
                  <option value="Gold Jani Single Cream Dhothy - 2.00">Gold Jani Single Cream Dhothy - 2.00</option>
                  <option value="Cotton Gold Tissue Single Dhothy 2007">Cotton Gold Tissue Single Dhothy 2007</option>
                  <option value="Cotton Copper Tissue Single Dhothy - 25.00">Cotton Copper Tissue Single Dhothy - 25.00</option>
                  <option value="Cotton Sea Green Dhothy Single">Cotton Sea Green Dhothy Single</option>
                  <option value="Good Jard Double White Dhothy">Good Jard Double White Dhothy</option>
                  <option value="Gold Dand Double Dhothy">Gold Dand Double Dhothy</option>
                  <option value="Cream Dhothy">Cream Dhothy</option>
                  <option value="Sahha Low Single White Dhothy">Sahha Low Single White Dhothy</option>
                  <option value="Ranaches Single Dhothy Only">Ranaches Single Dhothy Only</option>
                  <option value="White Heley Single Fancy White Dhothy">White Heley Single Fancy White Dhothy</option>
                  <option value="Double Roney White Dhothy">Double Roney White Dhothy</option>
                  <option value="Cotton White Heley Single">Cotton White Heley Single</option>
                  <option value="Double Cotton White Dhothy">Double Cotton White Dhothy</option>
                  <option value="Gold Jari White Angavastram">Gold Jari White Angavastram</option>
                  <option value="Gold Saw Cream Angavastram">Gold Saw Cream Angavastram</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    id="stock"
                    type="number"
                    placeholder="Available units"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min="0"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    placeholder="Unit price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex space-x-4">
            <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
              <Layers className="h-5 w-5 text-indigo-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="font-bold text-gray-800">{products.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
              <Package className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Total Stock</p>
                <p className="font-bold text-gray-800">
                  {products.reduce((sum, product) => sum + parseInt(product.stock || 0, 10), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        {isLoading && !showForm ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                // Only pass onEdit and onDelete if the role is admin
                onEdit={
                  role === "admin"
                    ? (p) => {
                        setEditingId(p._id);
                        setName(p.name);
                        setStock(p.stock.toString());
                        setPrice(p.price.toString());
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    : null
                }
                onDelete={role === "admin" ? handleDelete : null}
                role={role}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No products found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm ? "Try a different search term" : "Add your first product to get started"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
