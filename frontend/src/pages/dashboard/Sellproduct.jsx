import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SellProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state || {};
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  // Form State
  const [sellStock, setSellStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [receiverEmail, setReceiverEmail] = useState(""); // NEW
  const [receiverAddress, setReceiverAddress] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Dynamic Total Price Calculation
  const totalPrice = sellStock && unitPrice ? sellStock * unitPrice : 0;
  const finalPrice = totalPrice + (transportCost ? parseFloat(transportCost) : 0);

  // Email Validation Function
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSell = async (e) => {
    e.preventDefault();

    // Validation
    if (!sellStock || sellStock <= 0) {
      return setErrorMessage("Please enter a valid stock quantity.");
    }
    if (sellStock > product.stock) {
      return setErrorMessage(`Stock is not sufficient. Only ${product.stock} units available.`);
    }
    if (!unitPrice || unitPrice <= 0) {
      return setErrorMessage("Please enter a valid price per unit.");
    }
    if (!receiverName.trim()) {
      return setErrorMessage("Receiver name is required.");
    }
    if (!receiverContact.trim()) {
      return setErrorMessage("Receiver contact is required.");
    }
    if (!receiverEmail.trim() || !isValidEmail(receiverEmail)) {
      return setErrorMessage("Please enter a valid email address.");
    }
    if (!receiverAddress.trim()) {
      return setErrorMessage("Receiver address is required.");
    }
    if (!transportMode) {
      return setErrorMessage("Please select a transportation mode.");
    }
    if (!transportCost || transportCost < 0) {
      return setErrorMessage("Please enter a valid transportation cost.");
    }

    setErrorMessage("");

    // Convert input values to numbers where needed
    const sellStockValue = parseFloat(sellStock);
    const unitPriceValue = parseFloat(unitPrice);
    const transportCostValue = parseFloat(transportCost);

    const totalPrice = sellStockValue * unitPriceValue;
    const finalPrice = totalPrice + transportCostValue;

    const saleData = {
      productId: product.id,
      productName: product.name,
      sellStock: sellStockValue,
      unitPrice: unitPriceValue,
      totalAmount: finalPrice,
      receiverName,
      receiverContact,
      receiverEmail,
      receiverAddress,
      transportMode,
      transportCost: transportCostValue,
    };

    try {
      const res = await fetch(`${backendURL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) throw new Error("Failed to process sale");

      toast.success("Sale recorded successfully!");
      navigate("/dashboard");
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
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <input
              type="number"
              placeholder="Stock to Sell"
              value={sellStock}
              onChange={(e) => setSellStock(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            />

            <input
              type="number"
              placeholder="Price per Unit (₹)"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            />

            <input
              type="number"
              placeholder="Transportation Cost (₹)"
              value={transportCost}
              onChange={(e) => setTransportCost(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            />

            {/* Display Final Price */}
            <p className="text-lg font-semibold text-green-600">
              Final Price: ₹{finalPrice.toFixed(2)}
            </p>

            <input
              type="text"
              placeholder="Receiver Name"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            />

            <input
              type="text"
              placeholder="Receiver Contact"
              value={receiverContact}
              onChange={(e) => setReceiverContact(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            />

            <input
              type="email"
              placeholder="Receiver Email"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            />

            <textarea
              placeholder="Receiver Address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
            ></textarea>

            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-3 w-full"
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
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Confirm Sale
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-dashboard")}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
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
