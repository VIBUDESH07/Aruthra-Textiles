import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Download, Filter, X } from "lucide-react";

const backendURL = process.env.REACT_APP_BACKEND_URL;

const Reports = () => {
  const [report, setReport] = useState(null);
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-04-12");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const masterProductList = [
    "Gold Jari Single White Dhothy - 2.004",
    "Gold Jari Single Cream Dhothy - 2.00",
    "Cotton Gold Tissue Single Dhothy 2007",
    "Cotton Copper Tissue Single Dhothy - 25.00",
    "Cotton Sea Green Dhothy Single",
    "Good Jard Double White Dhothy",
    "Gold Dand Double Dhothy",
    "Cream Dhothy",
    "Sahha Low Single White Dhothy",
    "Ranaches Single Dhothy Only",
    "White Heley Single Fancy White Dhothy",
    "Double Roney White Dhothy",
    "Cotton White Heley Single",
    "Double Cotton White Dhothy",
    "Gold Jari White Angavastram",
    "Gold Saw Cream Angavastram",
  ];

  const transportModes = ["Road", "Air", "Sea", "Rail"];
  const orderStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${backendURL}/api/reports/sales`, {
        params: {
          from,
          to,
          productName: productSearch,
          receiverName: customerSearch,
          transportMode,
          orderStatus,
        },
      });
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
      setError("Failed to load reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [from, to, productSearch, customerSearch, transportMode, orderStatus]);

  const exportToCSV = () => {
    if (!report) return;
    const headers = ["Date,Total Sold,Total Revenue"];
    const dailySalesRows = report.dailySales.map(
      (item) => `${item._id},${item.totalSold},${item.totalRevenue}`
    );
    const csvContent = [...headers, ...dailySalesRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sales_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Responsive chart width
  const chartWidth = Math.min(window.innerWidth - 40, 600);
  const largeChartWidth = Math.min(window.innerWidth - 40, 800);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-xl text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            📊 Sales Analytics Dashboard
          </h1>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!report}
            aria-label="Export sales data to CSV"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 mb-6 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition w-full sm:w-auto focus:ring-2 focus:ring-gray-500"
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <Filter className="w-5 h-5 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                id="from-date"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select start date"
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                id="to-date"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select end date"
              />
            </div>
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <select
                id="product-name"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="border border-gray-300 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select product"
              >
                <option value="">All Products</option>
                {masterProductList.map((product, idx) => (
                  <option key={idx} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="border border-gray-300 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Search by customer name"
              />
            </div>
            <div>
              <label htmlFor="transport-mode" className="block text-sm font-medium text-gray-700 mb-1">
                Transport Mode
              </label>
              <select
                id="transport-mode"
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="border border-gray-300 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select transport mode"
              >
                <option value="">All Modes</option>
                {transportModes.map((mode, idx) => (
                  <option key={idx} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                id="order-status"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="border border-gray-300 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select order status"
              >
                <option value="">All Statuses</option>
                {orderStatuses.map((status, idx) => (
                  <option key={idx} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Revenue", value: `₹${report.overallSummary?.totalRevenue || 0}`, icon: "💵" },
            { label: "Units Sold", value: report.overallSummary?.totalSold || 0, icon: "📦" },
            { label: "Transport Cost", value: `₹${report.overallSummary?.totalTransport || 0}`, icon: "🚛" },
            { label: "Total Orders", value: report.overallSummary?.orders || 0, icon: "🧾" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 shadow-md rounded-xl text-center hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">📅 Daily Sales Trend</h2>
            <LineChart width={chartWidth} height={300} data={report.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalSold" stroke="#8884d8" name="Units Sold" />
              <Line type="monotone" dataKey="totalRevenue" stroke="#82ca9d" name="Revenue" />
            </LineChart>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">🏆 Top Selling Products</h2>
            <BarChart width={chartWidth} height={300} data={report.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSold" fill="#8884d8" />
            </BarChart>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">💰 Revenue by Product</h2>
            <PieChart width={chartWidth} height={300}>
              <Pie
                data={report.revenueByProduct}
                dataKey="revenue"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              />
              <Tooltip />
            </PieChart>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">🚚 Transport Mode Usage</h2>
            <BarChart width={chartWidth} height={300} data={report.transportStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalTransportCost" fill="#ffc658" />
            </BarChart>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">👥 Sales by Customer</h2>
            <BarChart width={chartWidth} height={300} data={report.topCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPurchased" fill="#ff7300" />
            </BarChart>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">📈 Monthly Revenue Trend</h2>
            <AreaChart width={chartWidth} height={300} data={report.monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="totalRevenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">📆 Monthly Sales Summary</h2>
          <LineChart width={largeChartWidth} height={300} data={report.monthlySummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Total Sales" />
            <Line type="monotone" dataKey="totalRevenue" stroke="#82ca9d" name="Total Revenue" />
          </LineChart>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">👥 Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-md">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 border font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 border font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 border font-semibold text-gray-700">Total Purchased</th>
                </tr>
              </thead>
              <tbody>
                {report.topCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border">{c._id}</td>
                    <td className="px-4 py-3 border">{c.contact}</td>
                    <td className="px-4 py-3 border">₹{c.totalPurchased}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Reports;