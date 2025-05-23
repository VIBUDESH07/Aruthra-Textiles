
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Download, Filter, X, Moon, Sun } from "lucide-react";
import { debounce } from "lodash";
import { jsPDF } from "jspdf";
import Chart from "chart.js/auto";

// Backend URL
const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Reports = () => {
  const [rawData, setRawData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Sample data for testing
  const sampleData = [
    {
      _id: "1",
      productId: "p1",
      productName: "Gold Jari Single White Dhothy - 2.004",
      sellStock: 10,
      unitPrice: 1000,
      totalAmount: 10000,
      receiverName: "John Doe",
      receiverEmail: "john@example.com",
      receiverContact: "1234567890",
      receiverAddress: "123 Main St",
      transportMode: "Road",
      transportCost: 500,
      invoiceNumber: 1001,
      date: "2025-01-01T10:00:00Z",
    },
    {
      _id: "2",
      productId: "p2",
      productName: "Cotton Sea Green Dhothy Single",
      sellStock: 5,
      unitPrice: 800,
      totalAmount: 4000,
      receiverName: "Jane Smith",
      receiverEmail: "jane@example.com",
      receiverContact: "0987654321",
      receiverAddress: "456 Oak St",
      transportMode: "Air",
      transportCost: 1000,
      invoiceNumber: 1002,
      date: "2025-02-01T12:00:00Z",
    },
  ];

  // Process raw data into report format
  const processedReport = useMemo(() => {
    if (!rawData.length) return null;

    // Apply filters
    const filteredData = rawData.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return false; // Skip invalid dates
      const fromDate = from ? new Date(from) : new Date("2000-01-01");
      const toDate = to ? new Date(to) : new Date("2100-12-31");
      toDate.setHours(23, 59, 59, 999); // Include full end date

      return (
        saleDate >= fromDate &&
        saleDate <= toDate &&
        (productSearch ? sale.productName.toLowerCase().includes(productSearch.toLowerCase()) : true) &&
        (customerSearch ? sale.receiverName.toLowerCase().includes(customerSearch.toLowerCase()) : true) &&
        (transportMode ? sale.transportMode === transportMode : true)
      );
    });

    if (!filteredData.length) return null;

    // Overall Summary
    const overallSummary = filteredData.reduce(
      (acc, sale) => ({
        totalRevenue: acc.totalRevenue + (sale.totalAmount || 0),
        totalSold: acc.totalSold + (sale.sellStock || 0),
        totalTransport: acc.totalTransport + (sale.transportCost || 0),
        orders: acc.orders.add(sale.invoiceNumber),
      }),
      { totalRevenue: 0, totalSold: 0, totalTransport: 0, orders: new Set() }
    );
    overallSummary.orders = overallSummary.orders.size;

    // Daily Sales
    const dailySalesMap = filteredData.reduce((acc, sale) => {
      const date = new Date(sale.date).toISOString().split("T")[0];
      acc[date] = acc[date] || { _id: date, totalSold: 0, totalRevenue: 0 };
      acc[date].totalSold += sale.sellStock || 0;
      acc[date].totalRevenue += sale.totalAmount || 0;
      return acc;
    }, {});
    const dailySales = Object.values(dailySalesMap).sort((a, b) => a._id.localeCompare(b._id));

    // Top Products
    const topProductsMap = filteredData.reduce((acc, sale) => {
      const product = sale.productName;
      acc[product] = acc[product] || { _id: product, totalSold: 0 };
      acc[product].totalSold += sale.sellStock || 0;
      return acc;
    }, {});
    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Revenue by Product
    const revenueByProductMap = filteredData.reduce((acc, sale) => {
      const product = sale.productName;
      acc[product] = acc[product] || { _id: product, revenue: 0 };
      acc[product].revenue += sale.totalAmount || 0;
      return acc;
    }, {});
    const revenueByProduct = Object.values(revenueByProductMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Transport Stats
    const transportStatsMap = filteredData.reduce((acc, sale) => {
      const mode = sale.transportMode || "Unknown";
      acc[mode] = acc[mode] || { _id: mode, totalTransportCost: 0 };
      acc[mode].totalTransportCost += sale.transportCost || 0;
      return acc;
    }, {});
    const transportStats = Object.values(transportStatsMap);

    // Top Customers
    const topCustomersMap = filteredData.reduce((acc, sale) => {
      const customer = sale.receiverName;
      acc[customer] = acc[customer] || { _id: customer, contact: sale.receiverEmail, totalPurchased: 0 };
      acc[customer].totalPurchased += sale.totalAmount || 0;
      return acc;
    }, {});
    const topCustomers = Object.values(topCustomersMap)
      .sort((a, b) => b.totalPurchased - a.totalPurchased)
      .slice(0, 20);

    // Monthly Summary
    const monthlySummaryMap = filteredData.reduce((acc, sale) => {
      const month = new Date(sale.date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = acc[month] || { _id: month, totalSales: 0, totalRevenue: 0 };
      acc[month].totalSales += sale.sellStock || 0;
      acc[month].totalRevenue += sale.totalAmount || 0;
      return acc;
    }, {});
    const monthlySummary = Object.values(monthlySummaryMap).sort((a, b) => a._id.localeCompare(b._id));

    return {
      overallSummary,
      dailySales,
      topProducts,
      revenueByProduct,
      transportStats,
      topCustomers,
      monthlySummary,
    };
  }, [rawData, from, to, productSearch, customerSearch, transportMode]);

  // Fetch raw data
  const debouncedFetchData = useMemo(
    () =>
      debounce(async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(`${backendURL}/api/reports/sales`, { timeout: 10000 });
          setRawData(res.data.length ? res.data : sampleData); // Fallback to sample data
        } catch (err) {
          console.error("Error fetching sales data", err);
          setError("Failed to load sales data. Using sample data.");
          setRawData(sampleData); // Fallback to sample data
        } finally {
          setLoading(false);
        }
      }, 100),
    []
  );

  useEffect(() => {
    debouncedFetchData();
    return () => debouncedFetchData.cancel();
  }, [debouncedFetchData]);

  // Chart.js initialization
  useEffect(() => {
    if (!processedReport) return;

    const chartConfigs = [
      {
        id: "dailySalesChart",
        type: "line",
        data: {
          labels: processedReport.dailySales.map((item) => item._id),
          datasets: [
            {
              label: "Units Sold",
              data: processedReport.dailySales.map((item) => item.totalSold),
              borderColor: "#8884d8",
              fill: false,
            },
            {
              label: "Revenue",
              data: processedReport.dailySales.map((item) => item.totalRevenue),
              borderColor: "#82ca9d",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "top" } },
        },
      },
      {
        id: "topProductsChart",
        type: "bar",
        data: {
          labels: processedReport.topProducts.map((item) => item._id),
          datasets: [
            {
              label: "Units Sold",
              data: processedReport.topProducts.map((item) => item.totalSold),
              backgroundColor: "#8884d8",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } } },
        },
      },
      {
        id: "revenueByProductChart",
        type: "pie",
        data: {
          labels: processedReport.revenueByProduct.map((item) => item._id),
          datasets: [
            {
              label: "Revenue",
              data: processedReport.revenueByProduct.map((item) => item.revenue),
              backgroundColor: ["#82ca9d", "#8884d8", "#ffc658", "#ff7300", "#ff4d4f"],
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: "right" } } },
      },
      {
        id: "transportModeChart",
        type: "bar",
        data: {
          labels: processedReport.transportStats.map((item) => item._id),
          datasets: [
            {
              label: "Transport Cost",
              data: processedReport.transportStats.map((item) => item.totalTransportCost),
              backgroundColor: "#ffc658",
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
      },
      {
        id: "topCustomersChart",
        type: "bar",
        data: {
          labels: processedReport.topCustomers.map((item) => item._id),
          datasets: [
            {
              label: "Total Purchased",
              data: processedReport.topCustomers.map((item) => item.totalPurchased),
              backgroundColor: "#ff7300",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } } },
        },
      },
      {
        id: "monthlyRevenueChart",
        type: "line",
        data: {
          labels: processedReport.monthlySummary.map((item) => item._id),
          datasets: [
            {
              label: "Revenue",
              data: processedReport.monthlySummary.map((item) => item.totalRevenue),
              borderColor: "#82ca9d",
              fill: true,
              backgroundColor: "rgba(130, 202, 157, 0.3)",
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: "top" } } },
      },
      {
        id: "monthlySummaryChart",
        type: "line",
        data: {
          labels: processedReport.monthlySummary.map((item) => item._id),
          datasets: [
            {
              label: "Total Sales",
              data: processedReport.monthlySummary.map((item) => item.totalSales),
              borderColor: "#8884d8",
              fill: false,
            },
            {
              label: "Total Revenue",
              data: processedReport.monthlySummary.map((item) => item.totalRevenue),
              borderColor: "#82ca9d",
              fill: false,
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: "top" } } },
      },
    ];

    chartConfigs.forEach((config) => {
      const ctx = document.getElementById(config.id)?.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: config.type,
          data: config.data,
          options: config.options,
        });
      }
    });

    return () => {
      chartConfigs.forEach((config) => {
        const chart = Chart.getChart(config.id);
        if (chart) chart.destroy();
      });
    };
  }, [processedReport]);

  // Export to CSV
  const exportToCSV = () => {
    if (!processedReport) return;
    const headers = ["Date,Total Sold,Total Revenue"];
    const dailySalesRows = processedReport.dailySales.map(
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

  // Export to PDF
  const exportToPDF = () => {
    if (!processedReport) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Aruthra Textiles Sales Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date Range: ${from || "All"} to ${to || "All"}`, 20, 30);
    doc.text(`Total Revenue: ₹${processedReport.overallSummary?.totalRevenue.toFixed(2) || 0}`, 20, 40);
    doc.text(`Units Sold: ${processedReport.overallSummary?.totalSold || 0}`, 20, 50);
    doc.text(`Total Orders: ${processedReport.overallSummary?.orders || 0}`, 20, 60);
    doc.save("sales_report.pdf");
  };

  // Clear filters
  const clearFilters = () => {
    setFrom("");
    setTo("");
    setProductSearch("");
    setCustomerSearch("");
    setTransportMode("");
    setShowFilters(false);
  };

  // Paginated top customers
  const paginatedCustomers = processedReport?.topCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = processedReport
    ? Math.ceil(processedReport.topCustomers.length / itemsPerPage)
    : 1;

  // Dark mode toggle
  useEffect(() => {
    document.body.className = darkMode ? "dark bg-gray-900" : "bg-gray-100";
  }, [darkMode]);

  // Check if any filters are applied
  const isFilterApplied = from || to || productSearch || customerSearch || transportMode;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mb-2"
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
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (!rawData.length && !isFilterApplied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-300">
          No sales data available. Please check the backend or add sales records.
        </p>
      </div>
    );
  }

  if (!processedReport) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-300">
          No sales data matches the selected filters. Try adjusting the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            📊 Sales Analytics Dashboard
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={!processedReport}
              aria-label="Export sales data to CSV"
            >
              <Download className="w-5 h-5 mr-2" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              disabled={!processedReport}
              aria-label="Export sales data to PDF"
            >
              <Download className="w-5 h-5 mr-2" />
              PDF
            </button>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 mb-6 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition w-full sm:w-auto focus:ring-2 focus:ring-gray-500"
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <Filter className="w-5 h-5 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                id="from-date"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label="Select start date"
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                id="to-date"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label="Select end date"
              />
            </div>
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="Search product..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                list="product-list"
                aria-label="Search by product name"
              />
              <datalist id="product-list">
                {masterProductList.map((product, idx) => (
                  <option key={idx} value={product} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label="Search by customer name"
              />
            </div>
            <div>
              <label htmlFor="transport-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transport Mode
              </label>
              <select
                id="transport-mode"
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                aria-label="Clear all filters"
              >
                <X className="w-5 h-5 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Applied Filters Summary */}
        {isFilterApplied && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Applied Filters:</h3>
            <div className="flex flex-wrap gap-4">
              {from && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-full">From: {from}</span>}
              {to && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-full">To: {to}</span>}
              {productSearch && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-full">Product: {productSearch}</span>
              )}
              {customerSearch && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-full">Customer: {customerSearch}</span>
              )}
              {transportMode && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-full">Transport: {transportMode}</span>
              )}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Revenue", value: `₹${processedReport.overallSummary?.totalRevenue.toFixed(2) || 0}`, icon: "💵", gradient: "from-blue-500 to-blue-700" },
            { label: "Units Sold", value: processedReport.overallSummary?.totalSold || 0, icon: "📦", gradient: "from-green-500 to-green-700" },
            { label: "Transport Cost", value: `₹${processedReport.overallSummary?.totalTransport.toFixed(2) || 0}`, icon: "🚛", gradient: "from-yellow-500 to-yellow-700" },
            { label: "Total Orders", value: processedReport.overallSummary?.orders || 0, icon: "🧾", gradient: "from-purple-500 to-purple-700" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-r ${item.gradient} p-6 shadow-md rounded-xl text-center text-white hover:shadow-xl transition transform hover:-translate-y-1`}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-sm font-medium">{item.label}</h3>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📅 Daily Sales Trend</h2>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <canvas id="dailySalesChart"></canvas>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">🏆 Top Selling Products</h2>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <canvas id="topProductsChart"></canvas>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">💰 Revenue by Product</h2>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <canvas id="revenueByProductChart"></canvas>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">🚚 Transport Mode Usage</h2>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <canvas id="transportModeChart"></canvas>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">👥 Sales by Customer</h2>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <canvas id="topCustomersChart"></canvas>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📈 Monthly Revenue Trend</h2>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <canvas id="monthlyRevenueChart"></canvas>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8 relative">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📆 Monthly Sales Summary</h2>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
              <svg
                className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
          <canvas id="monthlySummaryChart"></canvas>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">👥 Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-md">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                  <th className="px-4 py-3 border font-semibold text-gray-700 dark:text-gray-200">Customer</th>
                  <th className="px-4 py-3 border font-semibold text-gray-700 dark:text-gray-200">Contact</th>
                  <th className="px-4 py-3 border font-semibold text-gray-700 dark:text-gray-200">Total Purchased</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers?.length ? (
                  paginatedCustomers.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-4 py-3 border text-gray-900 dark:text-gray-100">{c._id}</td>
                      <td className="px-4 py-3 border text-gray-900 dark:text-gray-100">{c.contact}</td>
                      <td className="px-4 py-3 border text-gray-900 dark:text-gray-100">₹{c.totalPurchased.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>

        {/* Custom Tailwind Animation and Dark Mode Styles */}
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
          .dark .bg-gray-100 {
            background-color: #1f2937;
          }
          .dark .text-gray-900 {
            color: #f3f4f6;
          }
          .dark .text-gray-600 {
            color: #d1d5db;
          }
          .dark .border-gray-300 {
            border-color: #4b5563;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Reports;
