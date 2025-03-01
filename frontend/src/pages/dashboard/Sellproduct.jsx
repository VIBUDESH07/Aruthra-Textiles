import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SellProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state || {};

  // Form State
  const [sellStock, setSellStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Dynamic Total Price Calculation
  const totalPrice = sellStock && unitPrice ? sellStock * unitPrice : 0;
  const finalPrice = totalPrice + (transportCost ? parseFloat(transportCost) : 0);

  const handleSell = async (e) => {
    e.preventDefault();

    // Validation
    if (!sellStock || sellStock <= 0) {
      setErrorMessage("Please enter a valid stock quantity.");
      return;
    }
    if (sellStock > product.stock) {
      setErrorMessage(`Stock is not sufficient. Only ${product.stock} units available.`);
      return;
    }
    if (!unitPrice || unitPrice <= 0) {
      setErrorMessage("Please enter a valid price per unit.");
      return;
    }
    if (!receiverName || !receiverContact || !receiverAddress || !transportMode) {
      setErrorMessage("Please fill in all the receiver details.");
      return;
    }
    if (!transportCost || transportCost < 0) {
      setErrorMessage("Please enter a valid transportation cost.");
      return;
    }

    setErrorMessage("");
    
    const saleData = {
      productId: product.id,
      productName: product.name,
      sellStock,
      unitPrice,
      totalAmount: finalPrice,
      receiverName,
      receiverContact,
      receiverAddress,
      transportMode,
      transportCost,
    };

    try {
      const res = await fetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) throw new Error("Failed to process sale");

      toast.success("Sale recorded successfully!");
      navigate("/dashboard"); // Redirect after successful sale
    } catch (error) {
      toast.error("Error processing sale. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Sell Product</h1>

      {product?.id ? (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p>Available Stock: {product.stock}</p>

          {/* Sell Form */}
          <form onSubmit={handleSell} className="space-y-4 mt-4">
            <input
              type="number"
              placeholder="Stock to Sell"
              value={sellStock}
              onChange={(e) => {
                setSellStock(e.target.value);
                setErrorMessage("");
              }}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <input
              type="number"
              placeholder="Price per Unit (₹)"
              value={unitPrice}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value < 0) {
                  setErrorMessage("Price cannot be negative.");
                  setUnitPrice("");
                } else {
                  setUnitPrice(value);
                }
              }}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="number"
              placeholder="Cost of Transportation (₹)"
              value={transportCost}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value < 0) {
                  setErrorMessage("Transportation cost cannot be negative.");
                  setTransportCost("");
                } else {
                  setTransportCost(value);
                }
              }}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Display Total Price Dynamically */}
            <p className="text-lg font-semibold text-green-600">
              Final Price: ₹{finalPrice}
            </p>

            <input
              type="text"
              placeholder="Receiver Name"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Receiver Contact"
              value={receiverContact}
              onChange={(e) => setReceiverContact(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <textarea
              placeholder="Receiver Address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>

            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Transportation Mode</option>
              <option value="Courier">Courier</option>
              <option value="Truck">Truck</option>
              <option value="Train">Train</option>
              <option value="Air Cargo">Air Cargo</option>
            </select>

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Confirm Sale
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-dashboard")}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="text-center">Loading product details...</p>
      )}
    </div>
  );
}
