import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import {
  Search,
  Download,
  X,
  Package,
  Filter,
  ChevronDown,
  Eye,
  CheckSquare,
  Square,
} from "lucide-react";

const backendURL = process.env.REACT_APP_BACKEND_URL;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("invoiceNumber-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];
    if (searchTerm.trim()) {
      result = result.filter(
        (order) =>
          order.invoiceNumber.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((order) => order.status === statusFilter);
    }
    if (sortBy) {
      const [key, order] = sortBy.split("-");
      result.sort((a, b) => {
        const valA = key === "createdAt" ? new Date(a[key]) : a[key];
        const valB = key === "createdAt" ? new Date(b[key]) : b[key];
        return order === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
    }
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const decoded = jwtDecode(token);
      const userEmail = decoded.email;
      const userRole = decoded.role;

      let res;
      if (userRole === "user") {
        res = await fetch(`${backendURL}/api/sales/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: userEmail }),
        });
      } else {
        res = await fetch(`${backendURL}/api/sales/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");

    doc.setFontSize(14);
    doc.text("TAX INVOICE", 105, 15, { align: "center" });
    doc.text("(DUPLICATE FOR TRANSPORTER)", 195, 15, { align: "right" });

    doc.rect(10, 20, 190, 250);
    doc.line(130, 20, 130, 80);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ARUTHRA TEXTILE", 15, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const companyDetails = [
      "47/18 Gandhi Nagar, Pallipalayam Road, Komarapalayam - 638 183",
      "NAMAKKAL - 637 001",
      "GSTIN/UIN: 33AACOP5472R1Z1",
      "State Name: Tamil Nadu, Code: 33",
      "Contact: 9843267671, 7010855009",
      "Email: aruthra.textile@gmail.com",
      "www.aruthratextile.com",
    ];

    let y = 35;
    companyDetails.forEach((line) => {
      doc.text(line, 15, y);
      y += 5;
    });

    doc.setFontSize(8);
    const invoiceDetailsLabels = [
      "Invoice No.",
      "Dated",
      "Delivery Note",
      "Mode/Terms of Payment",
      "Reference No & Date",
      "Other References",
    ];

    const invoiceDetailsValues = [
      order.invoiceNumber?.toString() || "",
      new Date(order.createdAt).toLocaleDateString(),
      order.deliveryNote?.toString() || "",
      order.paymentMode?.toString() || "10 DAYS",
      order.referenceNo?.toString() || "",
      "",
    ];

    y = 30;
    invoiceDetailsLabels.forEach((label, index) => {
      doc.text(label, 135, y);
      doc.text(invoiceDetailsValues[index], 195, y, { align: "right" });
      y += 8;
    });

    doc.line(10, 80, 200, 80);
    doc.line(10, 110, 200, 110);

    doc.setFontSize(8);
    doc.text("Receiver (Bill to)", 15, 85);
    doc.setFont("helvetica", "bold");
    doc.text(order.receiverName?.toString() || "", 15, 90);
    doc.setFont("helvetica", "normal");
    doc.text(order.receiverAddress?.toString() || "", 15, 95);
    doc.text(`GSTIN/UIN: ${order.receiverGSTIN?.toString() || ""}`, 15, 100);
    doc.text(
      `State Name: ${order.receiverState?.toString() || "Tamil Nadu"}, Code: ${
        order.receiverStateCode?.toString() || "33"
      }`,
      15,
      105
    );

    doc.text("Dispatched through", 135, 85);
    doc.text(order.transportMode?.toString() || "BY TRANSPORT", 195, 85, {
      align: "right",
    });
    doc.text("Destination", 135, 90);
    doc.text(
      (order.destination || order.receiverAddress?.split(",").pop() || "").toString(),
      195,
      90,
      { align: "right" }
    );
    doc.text("Terms of Delivery", 135, 95);
    doc.text(order.termsOfDelivery?.toString() || "", 195, 95, { align: "right" });

    const products = [
      {
        name: order.productName?.toString() || "",
        hsn: order.hsn?.toString() || "521021",
        qty: order.sellStock?.toString() || "0",
        rate: order.unitPrice?.toFixed(2) || "0.00",
        per: "PCS",
        amount: order.totalAmount?.toFixed(2) || "0.00",
      },
    ];

    autoTable(doc, {
      startY: 115,
      head: [["Sl No", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Amount"]],
      body: products.map((product, index) => [
        (index + 1).toString(),
        product.name,
        product.hsn,
        product.qty,
        product.rate,
        product.per,
        `₹ ${product.amount}`,
      ]),
      foot: [
        [
          "",
          "",
          "",
          `${products.reduce((sum, p) => sum + parseInt(p.qty), 0)} PCS`,
          "",
          "",
          `₹ ${order.totalAmount?.toFixed(2) || "0.00"}`,
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    const taxRate = 2.5;
    const taxableValue = order.totalAmount;
    const cgstAmount = taxableValue * (taxRate / 100);
    const sgstAmount = taxableValue * (taxRate / 100);

    const finalY = doc.lastAutoTable.finalY || 180;
    doc.text("OUT PUT CGST 2.5%", 15, finalY + 10);
    doc.text(`${taxRate} %`, 150, finalY + 10);
    doc.text(`${cgstAmount.toFixed(2)}`, 195, finalY + 10, { align: "right" });

    doc.text("OUT PUT SGST 2.5%", 15, finalY + 15);
    doc.text(`${taxRate} %`, 150, finalY + 15);
    doc.text(`${sgstAmount.toFixed(2)}`, 195, finalY + 15, { align: "right" });

    doc.line(10, finalY + 25, 200, finalY + 25);
    doc.setFont("helvetica", "bold");
    doc.text("Total", 150, finalY + 30);
    doc.text(`₹ ${order.totalAmount?.toFixed(2) || "0.00"}`, 195, finalY + 30, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");

    doc.text("Amount Chargeable (in words)", 15, finalY + 40);
    doc.setFont("helvetica", "bold");
    doc.text(numberToWords(order.totalAmount || 0) + " Only", 15, finalY + 45);
    doc.setFont("helvetica", "normal");

    doc.line(10, finalY + 50, 200, finalY + 50);
    autoTable(doc, {
      startY: finalY + 55,
      head: [["HSN/SAC", "Taxable Value", "CGST", "", "SGST/UTGST", "", "Total Tax Amount"]],
      body: [
        [
          products[0].hsn,
          taxableValue.toFixed(2),
          `${taxRate}%`,
          cgstAmount.toFixed(2),
          `${taxRate}%`,
          sgstAmount.toFixed(2),
          (cgstAmount + sgstAmount).toFixed(2),
        ],
        [
          "Total",
          taxableValue.toFixed(2),
          "",
          cgstAmount.toFixed(2),
          "",
          sgstAmount.toFixed(2),
          (cgstAmount + sgstAmount).toFixed(2),
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    const taxTableY = doc.lastAutoTable.finalY || finalY + 80;
    doc.text("Tax Amount (in words)", 15, taxTableY + 10);
    doc.setFont("helvetica", "bold");
    doc.text(numberToWords(cgstAmount + sgstAmount) + " Only", 15, taxTableY + 15);
    doc.setFont("helvetica", "normal");

    doc.text("Company's Bank Details", 135, taxTableY + 10);
    doc.text("A/C Holder Name: ARUTHRA TEXTILE", 135, taxTableY + 15);
    doc.text("Bank Name: KARUR VYSYA BANK", 135, taxTableY + 20);
    doc.text("A/c No: 3217000590037", 135, taxTableY + 25);
    doc.text("Branch & IFS Code: KOMARAPALAYAM & TAMILNADU 0321", 135, taxTableY + 30);

    doc.setFontSize(6);
    doc.text("Declaration", 15, taxTableY + 40);
    doc.text(
      "(1) Interest will be charged @18% p.a. if payment is not received within 10 days. (2) We are not responsible for any loss",
      15,
      taxTableY + 45
    );
    doc.text(
      "or damage in transit. (3) Goods once sold cannot be taken back under any circumstances. (4) All dispute subject to",
      15,
      taxTableY + 50
    );
    doc.text("KOMARAPALAYAM Jurisdiction.", 15, taxTableY + 55);

    doc.text("SUBJECT TO KOMARAPALAYAM JURISDICTION", 105, taxTableY + 65, {
      align: "center",
    });
    doc.text("This is a Computer Generated Invoice", 105, taxTableY + 70, { align: "center" });

    doc.text("for ARUTHRA TEXTILE", 170, taxTableY + 40);
    doc.text("Authorised Signatory", 170, taxTableY + 55);

    doc.save(`Invoice_${order.invoiceNumber}.pdf`);
  };

  const generateBulkPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(14);
    doc.text("Bulk Order Invoices", 105, 15, { align: "center" });

    const selected = selectedOrders.length
      ? orders.filter((order) => selectedOrders.includes(order._id))
      : filteredOrders;

    selected.forEach((order, index) => {
      if (index > 0) doc.addPage();
      generatePDFContent(doc, order);
    });

    doc.save("Bulk_Invoices.pdf");
  };

  const generatePDFContent = (doc, order) => {
    doc.setFontSize(14);
    doc.text(`Invoice: ${order.invoiceNumber}`, 105, 15, { align: "center" });

    doc.rect(10, 20, 190, 250);
    doc.line(130, 20, 130, 80);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ARUTHRA TEXTILE", 15, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const companyDetails = [
      "47/18 Gandhi Nagar, Pallipalayam Road, Komarapalayam - 638 183",
      "NAMAKKAL - 637 001",
      "GSTIN/UIN: 33AACOP5472R1Z1",
      "State Name: Tamil Nadu, Code: 33",
      "Contact: 9843267671, 7010855009",
      "Email: aruthra.textile@gmail.com",
      "www.aruthratextile.com",
    ];

    let y = 35;
    companyDetails.forEach((line) => {
      doc.text(line, 15, y);
      y += 5;
    });

    doc.setFontSize(8);
    const invoiceDetailsLabels = [
      "Invoice No.",
      "Dated",
      "Delivery Note",
      "Mode/Terms of Payment",
      "Reference No & Date",
      "Other References",
    ];

    const invoiceDetailsValues = [
      order.invoiceNumber?.toString() || "",
      new Date(order.createdAt).toLocaleDateString(),
      order.deliveryNote?.toString() || "",
      order.paymentMode?.toString() || "10 DAYS",
      order.referenceNo?.toString() || "",
      "",
    ];

    y = 30;
    invoiceDetailsLabels.forEach((label, index) => {
      doc.text(label, 135, y);
      doc.text(invoiceDetailsValues[index], 195, y, { align: "right" });
      y += 8;
    });

    doc.line(10, 80, 200, 80);
    doc.line(10, 110, 200, 110);

    doc.setFontSize(8);
    doc.text("Receiver (Bill to)", 15, 85);
    doc.setFont("helvetica", "bold");
    doc.text(order.receiverName?.toString() || "", 15, 90);
    doc.setFont("helvetica", "normal");
    doc.text(order.receiverAddress?.toString() || "", 15, 95);
    doc.text(`GSTIN/UIN: ${order.receiverGSTIN?.toString() || ""}`, 15, 100);
    doc.text(
      `State Name: ${order.receiverState?.toString() || "Tamil Nadu"}, Code: ${
        order.receiverStateCode?.toString() || "33"
      }`,
      15,
      105
    );

    doc.text("Dispatched through", 135, 85);
    doc.text(order.transportMode?.toString() || "BY TRANSPORT", 195, 85, {
      align: "right",
    });
    doc.text("Destination", 135, 90);
    doc.text(
      (order.destination || order.receiverAddress?.split(",").pop() || "").toString(),
      195,
      90,
      { align: "right" }
    );
    doc.text("Terms of Delivery", 135, 95);
    doc.text(order.termsOfDelivery?.toString() || "", 195, 95, { align: "right" });

    const products = [
      {
        name: order.productName?.toString() || "",
        hsn: order.hsn?.toString() || "521021",
        qty: order.sellStock?.toString() || "0",
        rate: order.unitPrice?.toFixed(2) || "0.00",
        per: "PCS",
        amount: order.totalAmount?.toFixed(2) || "0.00",
      },
    ];

    autoTable(doc, {
      startY: 115,
      head: [["Sl No", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Amount"]],
      body: products.map((product, index) => [
        (index + 1).toString(),
        product.name,
        product.hsn,
        product.qty,
        product.rate,
        product.per,
        `₹ ${product.amount}`,
      ]),
      foot: [
        [
          "",
          "",
          "",
          `${products.reduce((sum, p) => sum + parseInt(p.qty), 0)} PCS`,
          "",
          "",
          `₹ ${order.totalAmount?.toFixed(2) || "0.00"}`,
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    const taxRate = 2.5;
    const taxableValue = order.totalAmount;
    const cgstAmount = taxableValue * (taxRate / 100);
    const sgstAmount = taxableValue * (taxRate / 100);

    const finalY = doc.lastAutoTable.finalY || 180;
    doc.text("OUT PUT CGST 2.5%", 15, finalY + 10);
    doc.text(`${taxRate} %`, 150, finalY + 10);
    doc.text(`${cgstAmount.toFixed(2)}`, 195, finalY + 10, { align: "right" });

    doc.text("OUT PUT SGST 2.5%", 15, finalY + 15);
    doc.text(`${taxRate} %`, 150, finalY + 15);
    doc.text(`${sgstAmount.toFixed(2)}`, 195, finalY + 15, { align: "right" });

    doc.line(10, finalY + 25, 200, finalY + 25);
    doc.setFont("helvetica", "bold");
    doc.text("Total", 150, finalY + 30);
    doc.text(`₹ ${order.totalAmount?.toFixed(2) || "0.00"}`, 195, finalY + 30, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");

    doc.text("Amount Chargeable (in words)", 15, finalY + 40);
    doc.setFont("helvetica", "bold");
    doc.text(numberToWords(order.totalAmount || 0) + " Only", 15, finalY + 45);
    doc.setFont("helvetica", "normal");

    doc.line(10, finalY + 50, 200, finalY + 50);
    autoTable(doc, {
      startY: finalY + 55,
      head: [["HSN/SAC", "Taxable Value", "CGST", "", "SGST/UTGST", "", "Total Tax Amount"]],
      body: [
        [
          products[0].hsn,
          taxableValue.toFixed(2),
          `${taxRate}%`,
          cgstAmount.toFixed(2),
          `${taxRate}%`,
          sgstAmount.toFixed(2),
          (cgstAmount + sgstAmount).toFixed(2),
        ],
        [
          "Total",
          taxableValue.toFixed(2),
          "",
          cgstAmount.toFixed(2),
          "",
          sgstAmount.toFixed(2),
          (cgstAmount + sgstAmount).toFixed(2),
        ],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    const taxTableY = doc.lastAutoTable.finalY || finalY + 80;
    doc.text("Tax Amount (in words)", 15, taxTableY + 10);
    doc.setFont("helvetica", "bold");
    doc.text(numberToWords(cgstAmount + sgstAmount) + " Only", 15, taxTableY + 15);
    doc.setFont("helvetica", "normal");

    doc.text("Company's Bank Details", 135, taxTableY + 10);
    doc.text("A/C Holder Name: ARUTHRA TEXTILE", 135, taxTableY + 15);
    doc.text("Bank Name: KARUR VYSYA BANK", 135, taxTableY + 20);
    doc.text("A/c No: 3217000590037", 135, taxTableY + 25);
    doc.text("Branch & IFS Code: KOMARAPALAYAM & TAMILNADU 0321", 135, taxTableY + 30);

    doc.setFontSize(6);
    doc.text("Declaration", 15, taxTableY + 40);
    doc.text(
      "(1) Interest will be charged @18% p.a. if payment is not received within 10 days. (2) We are not responsible for any loss",
      15,
      taxTableY + 45
    );
    doc.text(
      "or damage in transit. (3) Goods once sold cannot be taken back under any circumstances. (4) All dispute subject to",
      15,
      taxTableY + 50
    );
    doc.text("KOMARAPALAYAM Jurisdiction.", 15, taxTableY + 55);

    doc.text("SUBJECT TO KOMARAPALAYAM JURISDICTION", 105, taxTableY + 65, {
      align: "center",
    });
    doc.text("This is a Computer Generated Invoice", 105, taxTableY + 70, { align: "center" });

    doc.text("for ARUTHRA TEXTILE", 170, taxTableY + 40);
    doc.text("Authorised Signatory", 170, taxTableY + 55);
  };

  const numberToWords = (num) => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const numToWords = (n) => {
      if (n < 20) return units[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
      if (n < 1000)
        return units[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + numToWords(n % 100) : "");
      if (n < 100000)
        return (
          numToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          numToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "")
        );
      return (
        numToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "")
      );
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = "INR " + numToWords(rupees);
    if (paise > 0) {
      result += " and " + numToWords(paise) + " Paise";
    }

    return result;
  };

  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((order) => order._id));
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!selectedOrders.length) {
      toast.error("Please select at least one order");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedOrders.map((id) =>
          fetch(`${backendURL}/api/sales/transactions/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "Delivered" }),
          })
        )
      );
      toast.success("Selected orders marked as delivered");
      fetchOrders();
      setSelectedOrders([]);
    } catch (error) {
      toast.error("Failed to update orders");
    }
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          📦 Orders Dashboard
        </h1>

        {/* Search, Filter, and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-80">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by invoice, product, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-3 w-full border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              aria-label="Search orders"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              {/* <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select> */}
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                aria-label="Sort orders"
              >
                <option value="invoiceNumber-asc">Invoice No (Asc)</option>
                <option value="invoiceNumber-desc">Invoice No (Desc)</option>
                <option value="createdAt-asc">Date (Oldest First)</option>
                <option value="createdAt-desc">Date (Newest First)</option>
                <option value="totalAmount-asc">Total (Low to High)</option>
                <option value="totalAmount-desc">Total (High to Low)</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <button
              onClick={generateBulkPDF}
              className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
              aria-label="Export all to PDF"
            >
              <Download className="h-5 w-5 mr-2" />
              Export All
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between animate-fade-in">
            <span className="text-gray-700 font-medium">
              {selectedOrders.length} order(s) selected
            </span>
            <div className="flex space-x-4">
              <button
                onClick={generateBulkPDF}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                aria-label="Export selected to PDF"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </button>
              <button
                onClick={handleMarkAsDelivered}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                aria-label="Mark selected as delivered"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Mark as Delivered
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {isLoading ? (
          <div className="grid md:grid-cols-1 gap-6">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table
              className="w-full border-collapse"
              aria-label="Orders table"
            >
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="focus:outline-none"
                      aria-label={
                        selectedOrders.length === paginatedOrders.length
                          ? "Deselect all orders"
                          : "Select all orders"
                      }
                    >
                      {selectedOrders.length === paginatedOrders.length ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Invoice No</th>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Qty</th>
                  <th className="px-6 py-4 text-left">Total Price</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  {/* <th className="px-6 py-4 text-left">Status</th> */}
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectOrder(order._id)}
                        className="focus:outline-none"
                        aria-label={
                          selectedOrders.includes(order._id)
                            ? "Deselect order"
                            : "Select order"
                        }
                      >
                        {selectedOrders.includes(order._id) ? (
                          <CheckSquare className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">{order.invoiceNumber}</td>
                    <td className="px-6 py-4">{order.productName}</td>
                    <td className="px-6 py-4">{order.sellStock}</td>
                    <td className="px-6 py-4">₹{order.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4">{order.receiverName}</td>
                    {/* <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={() => setModalOrder(order)}
                        className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-lg transition-all duration-200"
                        aria-label="View order details"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => generatePDF(order)}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg transition-all duration-200"
                        aria-label="View invoice PDF"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700">No orders found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filter"
                : "No orders available"}
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                aria-label="Clear filters"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-all duration-200"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span aria-live="polite">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-all duration-200"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {modalOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Order details modal"
          >
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Order Details: {modalOrder.invoiceNumber}
                </h2>
                <button
                  onClick={() => setModalOrder(null)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Product:</strong> {modalOrder.productName}
                </p>
                <p>
                  <strong>Quantity:</strong> {modalOrder.sellStock} PCS
                </p>
                <p>
                  <strong>Unit Price:</strong> ₹{modalOrder.unitPrice?.toFixed(2)}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{modalOrder.totalAmount?.toFixed(2)}
                </p>
                <p>
                  <strong>Customer:</strong> {modalOrder.receiverName}
                </p>
                <p>
                  <strong>Address:</strong> {modalOrder.receiverAddress}
                </p>
                <p>
                  <strong>GSTIN:</strong> {modalOrder.receiverGSTIN || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {modalOrder.status || "Pending"}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(modalOrder.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Transport Mode:</strong> {modalOrder.transportMode || "N/A"}
                </p>
                <p>
                  <strong>Destination:</strong>{" "}
                  {modalOrder.destination || modalOrder.receiverAddress?.split(",").pop() || "N/A"}
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => generatePDF(modalOrder)}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  aria-label="Download invoice"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        )}

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
            0%,
            100% {
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
    </div>
  );
};

export default Orders;