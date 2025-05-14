import { useEffect, useState, useRef } from "react";
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
  ShoppingBag,
  Phone,
  ChevronDown,
} from "lucide-react";
import ProductCard from "../../components/ProductCard";

const backendURL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const searchInputRef = useRef(null);

  const token = localStorage.getItem("token");
  let userId = null;
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
      role = decoded.role;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let sortedProducts = [...products];
    if (searchTerm.trim()) {
      sortedProducts = sortedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy) {
      const [key, order] = sortBy.split("-");
      sortedProducts.sort((a, b) => {
        const valA = key === "name" ? a[key].toLowerCase() : a[key];
        const valB = key === "name" ? b[key].toLowerCase() : b[key];
        return order === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
    }
    setFilteredProducts(sortedProducts);
  }, [searchTerm, products, sortBy]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendURL}/api/materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
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
      createdBy: userId,
    };

    setIsLoading(true);
    try {
      const res = await fetch(
        `${backendURL}/api/materials${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(product),
        }
      );

      if (!res.ok) throw new Error("Failed to save product");
      toast.success(`Product ${editingId ? "updated" : "added"} successfully`);
      fetchProducts();
      resetForm();
    } catch (error) {
      toast.error("Error saving product");
    } finally {
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setShowFormModal(false);
    setEditingId(null);
    setName("");
    setStock("");
    setPrice("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setStock(product.stock.toString());
    setPrice(product.price.toString());
    setShowFormModal(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-10 w-10 text-indigo-700 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Inventory Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchProducts}
              className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-all duration-200 hover:scale-105"
              title="Refresh Products"
              aria-label="Refresh products"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            {role === "admin" && !showFormModal && (
              <button
                onClick={() => setShowFormModal(true)}
                className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                aria-label="Add new product"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            )}
            {role === "user" && (
              <a
                href="tel:9994357571"
                className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                aria-label="Contact support"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contact: 99943 57571
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Form Modal (Admin Only) */}
        {role === "admin" && showFormModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Product form modal"
          >
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
                  aria-label="Close form modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Name
                  </label>
                  <select
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border border-gray-200 rounded-lg p-3 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    aria-label="Select product name"
                  >
                    <option value="" disabled>
                      Select a product
                    </option>
                    {[
                      "Gold Jari Single White Dhothy - 2.004",
                      "Gold Jari Single Cream Dhothy - 2.00",
                      "Cotton Gold Tissue Single Dhothy 2007",
                      "Cotton Copper Tissue Single Dhothy - 25.00",
                      "Cotton Sea Green Dhothy Single",
                      "Good Jard Double White Dhothy",
                      "Gold Dand Double Dhothy",
                      "Cream Dhothy",
                      "Sahha Low Single White Dhothy",
                      "White Heley Single Fancy White Dhothy",
                      "Double Roney White Dhothy",
                      "Cotton White Heley Single",
                      "Double Cotton White Dhothy",
                      "Gold Jari White Angavastram",
                      "Gold Saw Cream Angavastram",
                    ].map((product, idx) => (
                      <option key={idx} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="stock"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                      className="border border-gray-200 rounded-lg p-3 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      aria-label="Enter stock quantity"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                      className="border border-gray-200 rounded-lg p-3 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      aria-label="Enter unit price"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    aria-label="Cancel form"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
                    aria-label={editingId ? "Update product" : "Save product"}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingId ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-80">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-3 w-full border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              aria-label="Search products"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                aria-label="Sort products"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center transform hover:scale-105 transition-all duration-200">
              <Layers className="h-6 w-6 text-indigo-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-lg font-bold text-gray-800">{products.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center transform hover:scale-105 transition-all duration-200">
              <Package className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Total Stock</p>
                <p className="text-lg font-bold text-gray-800">
                  {products.reduce((sum, product) => sum + parseInt(product.stock || 0, 10), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        {isLoading && !showFormModal ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="transition-all duration-300 transform hover:-translate-y-1"
              >
                <ProductCard
                  product={product}
                  onEdit={role === "admin" ? handleEdit : null}
                  onDelete={role === "admin" ? handleDelete : null}
                  role={role}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700">No products found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm ? "Try a different search term" : "Add your first product to get started"}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                aria-label="Clear search term"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;