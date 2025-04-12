import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {jwtDecode }from "jwt-decode";

const backendURL = process.env.REACT_APP_BACKEND_URL;



export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const generatePDF = (order) => {
    const doc = new jsPDF();
    
    // Set font
    doc.setFont("helvetica");
    
    // Add title
    doc.setFontSize(14);
    doc.text("TAX INVOICE", 100, 15, { align: "center" });
    doc.text("(DUPLICATE FOR TRANSPORTER)", 350, 15, { align: "right" });
    
    // Draw border around the page
    doc.rect(10, 20, 190, 250);
    
    // Draw vertical line to separate company and invoice details
    doc.line(130, 20, 130, 80);
    
    // Company details (left side)
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
      "www.aruthratextile.com"
    ];
    
    let y = 35;
    companyDetails.forEach(line => {
      doc.text(line, 15, y);
      y += 5;
    });
    
    // Invoice details (right side)
    doc.setFontSize(8);
    const invoiceDetailsLabels = [
      "Invoice No.",
      "Dated",
      "Delivery Note",
      "Mode/Terms of Payment",
      "Reference No & Date",
      "Other References"
    ];
    
    const invoiceDetailsValues = [
      order.invoiceNumber?.toString() || "",
      new Date(order.createdAt).toLocaleDateString(),
      order.deliveryNote?.toString() || "",
      order.paymentMode?.toString() || "10 DAYS",
      order.referenceNo?.toString() || "",
      ""
    ];
    
    y = 30;
    invoiceDetailsLabels.forEach((label, index) => {
      doc.text(label, 135, y);
      doc.text(invoiceDetailsValues[index], 180, y, { align: "right" });
      y += 8;
    });
    
    // Buyer details section
    doc.line(10, 80, 200, 80);
    doc.line(10, 110, 200, 110);
    
    // Left side - Receiver details
    doc.setFontSize(8);
    doc.text("Receiver (Bill to)", 15, 85);
    doc.setFont("helvetica", "bold");
    doc.text(order.receiverName?.toString() || "", 15, 90);
    doc.setFont("helvetica", "normal");
    doc.text(order.receiverAddress?.toString() || "", 15, 95);
    doc.text(`GSTIN/UIN: ${order.receiverGSTIN?.toString() || ""}`, 15, 100);
    doc.text(`State Name: ${order.receiverState?.toString() || "Tamil Nadu"}, Code: ${order.receiverStateCode?.toString() || "33"}`, 15, 105);
    
    // Right side - Dispatch details
    doc.text("Dispatched through", 135, 85);
    doc.text(order.transportMode?.toString() || "BY TRANSPORT", 180, 85, { align: "right" });
    doc.text("Destination", 135, 90);
    doc.text((order.destination || order.receiverAddress?.split(",").pop() || "").toString(), 180, 90, { align: "right" });
    doc.text("Terms of Delivery", 135, 95);
    doc.text(order.termsOfDelivery?.toString() || "", 180, 95, { align: "right" });
    
    // Product table
    const products = [{
      name: order.productName?.toString() || "",
      hsn: order.hsn?.toString() || "521021",
      qty: order.sellStock?.toString() || "0",
      rate: order.unitPrice?.toFixed(2) || "0.00",
      per: "PCS",
      amount: order.totalAmount?.toFixed(2) || "0.00"
    }];
    
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
        `₹ ${product.amount}`
      ]),
      foot: [
        ["", "", "", `${products.reduce((sum, p) => sum + parseInt(p.qty), 0)} PCS`, "", "", `₹ ${order.totalAmount?.toFixed(2) || "0.00"}`]
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      }
    });
    
    // Calculate tax amounts
    const taxRate = 2.5; // 2.5% for CGST and SGST each
    const taxableValue = order.totalAmount ;
    const cgstAmount = taxableValue * (taxRate / 100);
    const sgstAmount = taxableValue * (taxRate / 100);
    
    // Tax details
    const finalY = doc.lastAutoTable.finalY || 180;
    
    doc.text("OUT PUT CGST 2.5%", 15, finalY + 10);
    doc.text(`${taxRate} %`, 150, finalY + 10);
    doc.text(`${cgstAmount.toFixed(2)}`, 180, finalY + 10, { align: "right" });
    
    doc.text("OUT PUT SGST 2.5%", 15, finalY + 15);
    doc.text(`${taxRate} %`, 150, finalY + 15);
    doc.text(`${sgstAmount.toFixed(2)}`, 180, finalY + 15, { align: "right" });
    
    // Total
    doc.line(10, finalY + 25, 200, finalY + 25);
    doc.setFont("helvetica", "bold");
    doc.text("Total", 150, finalY + 30);
    doc.text(`₹ ${order.totalAmount?.toFixed(2) || "0.00"}`, 180, finalY + 30, { align: "right" });
    doc.setFont("helvetica", "normal");
    
    // Amount in words
    doc.text("Amount Chargeable (in words)", 15, finalY + 40);
    doc.setFont("helvetica", "bold");
    doc.text(numberToWords(order.totalAmount || 0) + " Only", 15, finalY + 45);
    doc.setFont("helvetica", "normal");
    
    // Tax breakdown
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
          (cgstAmount + sgstAmount).toFixed(2)
        ],
        [
          "Total", 
          taxableValue.toFixed(2), 
          "", 
          cgstAmount.toFixed(2), 
          "", 
          sgstAmount.toFixed(2), 
          (cgstAmount + sgstAmount).toFixed(2)
        ]
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      }
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
    doc.text("(1) Interest will be charged @18% p.a. if payment is not received within 10 days. (2) We are not responsible for any loss", 15, taxTableY + 45);
    doc.text("or damage in transit. (3) Goods once sold cannot be taken back under any circumstances. (4) All dispute subject to", 15, taxTableY + 50);
    doc.text("KOMARAPALAYAM Jurisdiction.", 15, taxTableY + 55);
    
    doc.text("SUBJECT TO KOMARAPALAYAM JURISDICTION", 100, taxTableY + 65, { align: "center" });
    doc.text("This is a Computer Generated Invoice", 100, taxTableY + 70, { align: "center" });
    
    doc.text("for ARUTHRA TEXTILE", 170, taxTableY + 40);
    doc.text("Authorised Signatory", 170, taxTableY + 55);
    
    doc.save(`Invoice_${order.invoiceNumber}.pdf`);
  };  
  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWords = (n) => {
      if (n < 20) return units[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
      if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '');
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let result = 'INR ' + numToWords(rupees);
    if (paise > 0) {
      result += ' and ' + numToWords(paise) + ' Paise';
    }
    
    return result;
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
