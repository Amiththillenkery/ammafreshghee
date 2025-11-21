# 📄 PDF Invoice & Delivery Slip Guide

## Overview

The admin panel now supports generating **printable PDF documents** that combine a delivery slip and invoice on a single A4 sheet, designed to be cut in half.

---

## 📋 PDF Layout

Each PDF is designed for **A4 paper** and split into two equal halves:

```
╔════════════════════════════════════════════╗
║                                            ║
║         TOP HALF: DELIVERY SLIP            ║
║                                            ║
║  FROM (Return Address)  |  TO (Customer)  ║
║  Amma Fresh Ghee        |  Customer Name  ║
║  Shop Address           |  Delivery Addr  ║
║  Phone Number           |  Phone          ║
║                                            ║
║  Order #123  |  Date  |  Amount  |  COD   ║
║                                            ║
╠═══════════ ✂ CUT HERE ✂ ══════════════════╣
║                                            ║
║          BOTTOM HALF: INVOICE              ║
║                                            ║
║  INVOICE #123                              ║
║  Company Info     |    Bill To             ║
║                                            ║
║  ┌──────────────────────────────────────┐ ║
║  │ Items Table with Quantities & Prices │ ║
║  └──────────────────────────────────────┘ ║
║                                            ║
║  Subtotal: ₹XXX                           ║
║  Delivery: ₹XX                            ║
║  Total: ₹XXX                              ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 🚀 How to Generate PDF

### From Admin Panel UI

1. **Log into Admin Panel:**
   ```
   http://localhost:3001
   ```

2. **Find the order** you want to print

3. **Click the "📄 PDF" button** next to the order

4. **PDF will open in a new tab** or download automatically

### From API Directly

```
GET http://localhost:3001/api/orders/:id/pdf
```

Example:
```bash
# Download PDF for order ID 14
curl -o invoice.pdf http://localhost:3001/api/orders/14/pdf
```

---

## 🖨️ Printing Instructions

### Option 1: Print from Browser

1. Click "📄 PDF" button
2. PDF opens in new tab
3. Click Print (Ctrl+P / Cmd+P)
4. **Settings:**
   - Paper: A4
   - Orientation: Portrait
   - Margins: None or Minimal
   - Scale: 100%
5. Print
6. **Cut the paper in half** along the dotted line

### Option 2: Batch Printing

1. Filter orders by date or status
2. Open multiple PDFs in tabs
3. Use browser's print function
4. Print all at once
5. Cut papers in half

---

## 📐 PDF Components

### Top Half: Delivery Slip

**Purpose:** Attach to package for delivery

**Contains:**
- ✅ **FROM Address** (Return address - Your shop)
  - Company name
  - Shop address
  - Phone number
  
- ✅ **TO Address** (Customer - in prominent box)
  - Customer name (in bold uppercase)
  - Full delivery address
  - City and pincode
  - Landmark (if provided)
  - Phone number (in bold)
  
- ✅ **Order Summary**
  - Order number
  - Order date
  - Payment method (PAID/COD)
  - Total amount (highlighted in gold)

### Bottom Half: Invoice

**Purpose:** Accounting and customer receipt

**Contains:**
- ✅ **Invoice Header**
  - Invoice number (same as order number)
  - Invoice date
  
- ✅ **Bill From/To**
  - Company information (left)
  - Customer information (right)
  
- ✅ **Items Table**
  - Product name
  - Quantity
  - Unit price
  - Line total
  
- ✅ **Totals Section**
  - Subtotal
  - Delivery charges
  - Grand total (highlighted)
  
- ✅ **Footer**
  - Thank you message
  - Company email

---

## 🎨 Customization

### Update Company Information

Edit `admin-panel/pdfService.js`:

```javascript
this.companyInfo = {
  name: 'Amma Fresh Ghee',                    // Your company name
  address: 'Your Shop Address',                // Full address
  city: 'Your City',                           // City
  state: 'Your State',                         // State
  pincode: '560001',                           // Pin code
  phone: '+91-XXXXXXXXXX',                     // Phone number
  email: 'contact@ammafreshghee.com',          // Email
  gst: 'GST No: XXXXXXXXXXXX'                  // GST number (optional)
};
```

### Change Colors

The PDF uses these colors:
- **Gold/Yellow (`#d4af37`)**: Headers, highlights, borders
- **Green**: Confirmed/paid status
- **Gray**: General text
- **Black**: Main content

To change colors, edit the `pdfService.js` file and search for color codes.

---

## 📱 Features

### Delivery Slip
- ✅ Large, clear customer address box
- ✅ Return address for failed deliveries
- ✅ Payment status clearly marked (COD/PAID)
- ✅ Order number for tracking
- ✅ Phone number for delivery person to call

### Invoice
- ✅ Professional invoice layout
- ✅ Detailed item breakdown
- ✅ Clear pricing and totals
- ✅ Company branding
- ✅ Legal compliance ready (add GST number)

---

## 🔧 Technical Details

### Technology
- **Library:** PDFKit (Node.js)
- **Format:** A4 (595.28 x 841.89 points)
- **File Size:** ~15-25 KB per PDF
- **Font:** Helvetica (standard)

### API Response
```javascript
{
  "Content-Type": "application/pdf",
  "Content-Disposition": "attachment; filename='Order_AFK1234567890.pdf'"
}
```

---

## 🐛 Troubleshooting

### PDF doesn't generate

**Check:**
1. Server is running: `http://localhost:3001/api/health`
2. Order exists in database
3. Order has items associated with it
4. Check server logs for errors

### Incorrect information

**Fix:**
1. Update company info in `pdfService.js`
2. Restart server
3. Regenerate PDF

### Layout issues

**Check:**
1. Print settings (A4, Portrait, 100% scale)
2. Browser print preview
3. PDF viewer compatibility

### Can't cut properly

**Tip:**
- Look for the dashed line with "✂ CUT HERE ✂" text
- Use a ruler and sharp blade/scissors
- Line is exactly at 50% height (420.95 points)

---

## 💡 Usage Tips

### For COD Orders
1. Print PDF when order is confirmed
2. Cut in half
3. Attach delivery slip to package
4. Keep invoice for accounting

### For Prepaid Orders
1. Print after payment confirmation
2. Both halves go to customer
3. Keep digital/physical copy for records

### Batch Processing
1. Filter orders by date (e.g., today's orders)
2. Open all PDFs in separate tabs
3. Print all at once
4. Cut all sheets
5. Organize by delivery route

---

## 📊 Best Practices

1. **Daily Routine:**
   - Filter today's confirmed orders
   - Print all PDFs at once
   - Organize by area/pincode
   - Prepare packages with delivery slips

2. **Quality Control:**
   - Verify customer address before printing
   - Check phone numbers are correct
   - Ensure item quantities match

3. **Record Keeping:**
   - Keep invoice copies (physical or digital)
   - Archive PDFs by month
   - Use for accounting and tax purposes

---

## 🎯 Use Cases

### Scenario 1: Daily Delivery
```
1. Morning: Filter yesterday's confirmed orders
2. Print all PDFs
3. Cut sheets
4. Attach delivery slips to packages
5. Keep invoices for reference
```

### Scenario 2: Single Order
```
1. Customer calls for order confirmation
2. Click PDF button for that order
3. Print immediately
4. Cut and attach to package
5. Ready for same-day delivery
```

### Scenario 3: Month-end Accounting
```
1. Filter orders by month
2. Download all PDFs
3. Print invoices for accounting
4. File for tax purposes
```

---

## 📞 Support

For issues with PDF generation:
1. Check server logs: `npm start` console output
2. Test API endpoint: `/api/orders/:id/pdf`
3. Verify PDFKit is installed: `npm list pdfkit`

---

## ✅ Checklist

Before printing:
- [ ] Company information is updated in `pdfService.js`
- [ ] Server is running on port 3001
- [ ] Order has complete information
- [ ] Printer is set to A4 paper
- [ ] Print scale is 100%
- [ ] Have scissors/blade ready for cutting

---

**Made for:** Amma Fresh Ghee Admin Panel  
**Last Updated:** $(date)  
**Version:** 1.0

