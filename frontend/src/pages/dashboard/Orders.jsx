import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/sales/transactions");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice", 90, 10);
    doc.setFontSize(12);
    doc.text(`Invoice No: ${order.invoiceNumber}`, 10, 20);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 10, 30);
    doc.text(`Customer: ${order.receiverName}`, 10, 40);
    doc.text(`Contact: ${order.receiverContact}`, 10, 50);
    doc.text(`Address: ${order.receiverAddress}`, 10, 60);
    
    doc.autoTable({
      startY: 70,
      head: [["Product Name", "Qty", "Unit Price", "Total"]],
      body: [[order.productName, order.sellStock, `₹${order.unitPrice}`, `₹${order.totalAmount}`]],
    });

    doc.text(`Transport Mode: ${order.transportMode}`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Transport Cost: ₹${order.transportCost}`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Grand Total: ₹${order.totalAmount}`, 10, doc.autoTable.previous.finalY + 30);

    doc.save(`Invoice_${order.invoiceNumber}.pdf`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Orders</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Invoice No</th>
              <th className="border px-4 py-2">Product</th>
              <th className="border px-4 py-2">Qty</th>
              <th className="border px-4 py-2">Total Price</th>
              <th className="border px-4 py-2">Customer</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="text-center">
                <td className="border px-4 py-2">{order.invoiceNumber}</td>
                <td className="border px-4 py-2">{order.productName}</td>
                <td className="border px-4 py-2">{order.sellStock}</td>
                <td className="border px-4 py-2">₹{order.totalAmount}</td>
                <td className="border px-4 py-2">{order.receiverName}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => generatePDF(order)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg"
                  >
                    View Bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
