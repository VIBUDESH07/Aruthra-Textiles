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
} from "recharts";
const backendURL = process.env.REACT_APP_BACKEND_URL;

const Reports = () => {
  const [report, setReport] = useState(null);
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-04-12");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
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
  
  const fetchReport = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/reports/sales`, {
        params: {
          from,
          to,
          productName: productSearch,
          receiverName: customerSearch,
        },
      });
      setReport(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [from, to, productSearch, customerSearch]);

  if (!report) return <p className="text-center text-lg p-10">Loading reports...</p>;

  return (
    <div className="p-6 space-y-12 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">📊 Sales Reports Dashboard</h1>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border px-3 py-2 w-full rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border px-3 py-2 w-full rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
          <select
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="border px-3 py-2 w-full rounded-md"
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
          <input
            type="text"
            placeholder="Search customer..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="border px-3 py-2 w-full rounded-md"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `₹${report.overallSummary?.totalRevenue}`, icon: "💵" },
          { label: "Units Sold", value: report.overallSummary?.totalSold, icon: "📦" },
          { label: "Transport Cost", value: `₹${report.overallSummary?.totalTransport}`, icon: "🚛" },
          { label: "Total Orders", value: report.overallSummary?.orders, icon: "🧾" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-5 shadow-md rounded-xl text-center hover:shadow-lg transition"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
            <p className="text-xl font-bold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">📅 Daily Sales</h2>
          <LineChart width={600} height={300} data={report.dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSold" stroke="#8884d8" />
            <Line type="monotone" dataKey="totalRevenue" stroke="#82ca9d" />
          </LineChart>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">🏆 Top Selling Products</h2>
          <BarChart width={600} height={300} data={report.topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSold" fill="#8884d8" />
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">💰 Revenue by Product</h2>
          <PieChart width={400} height={300}>
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
          <BarChart width={600} height={300} data={report.transportStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalTransportCost" fill="#ffc658" />
          </BarChart>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">📆 Monthly Summary</h2>
        <LineChart width={800} height={300} data={report.monthlySummary}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
          <Line type="monotone" dataKey="totalRevenue" stroke="#82ca9d" />
        </LineChart>
      </div>

      {/* Top Customers */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">👥 Top Customers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Customer</th>
                <th className="px-4 py-2 border">Contact</th>
                <th className="px-4 py-2 border">Total Purchased</th>
              </tr>
            </thead>
            <tbody>
              {report.topCustomers.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border">{c._id}</td>
                  <td className="px-4 py-2 border">{c.contact}</td>
                  <td className="px-4 py-2 border">₹{c.totalPurchased}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
