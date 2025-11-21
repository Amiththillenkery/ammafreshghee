import PDFDocument from 'pdfkit';

/**
 * PDF Service for generating delivery slip and invoice
 * Format: A4 page split into 2 halves
 * - Top half: Delivery address slip
 * - Bottom half: Invoice
 */

class PDFService {
  constructor() {
    // A4 dimensions in points (72 points = 1 inch)
    this.pageWidth = 595.28; // A4 width
    this.pageHeight = 841.89; // A4 height
    this.halfHeight = this.pageHeight / 2;
    this.margin = 30;
    
    // Company details (return address)
    this.companyInfo = {
      name: 'Amma Fresh Ghee',
      address: 'Your Shop Address',
      city: 'Your City',
      state: 'Your State',
      pincode: '560001',
      phone: '+91-XXXXXXXXXX',
      email: 'contact@ammafreshghee.com',
      gst: 'GST No: XXXXXXXXXXXX' // Add GST number if applicable
    };
  }

  /**
   * Generate PDF for order
   * @param {Object} order - Order details
   * @param {Array} items - Order items
   * @returns {PDFDocument} PDF document stream
   */
  generateOrderPDF(order, items) {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: this.margin,
        bottom: this.margin,
        left: this.margin,
        right: this.margin
      }
    });

    // Draw cutting line in the middle
    this.drawCuttingLine(doc);

    // Top half: Delivery address slip
    this.drawDeliverySlip(doc, order);

    // Bottom half: Invoice
    this.drawInvoice(doc, order, items);

    doc.end();
    return doc;
  }

  /**
   * Draw cutting line in the middle of the page
   */
  drawCuttingLine(doc) {
    doc.save();
    doc.strokeColor('#cccccc')
       .lineWidth(1)
       .dash(5, { space: 5 });
    
    // Horizontal cutting line
    doc.moveTo(0, this.halfHeight)
       .lineTo(this.pageWidth, this.halfHeight)
       .stroke();
    
    // Add scissors icon text
    doc.fillColor('#999999')
       .fontSize(10)
       .text('✂ CUT HERE ✂', this.margin, this.halfHeight - 15, {
         width: this.pageWidth - (this.margin * 2),
         align: 'center'
       });
    
    doc.restore();
  }

  /**
   * Draw delivery address slip (top half)
   */
  drawDeliverySlip(doc, order) {
    let y = this.margin;
    const contentWidth = this.pageWidth - (this.margin * 2);

    // Title
    doc.fontSize(18)
       .fillColor('#d4af37')
       .font('Helvetica-Bold')
       .text('DELIVERY ADDRESS', this.margin, y, {
         width: contentWidth,
         align: 'center'
       });
    
    y += 35;

    // From (Return Address) - Left side
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text('FROM:', this.margin, y);
    
    y += 15;

    doc.fontSize(11)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(this.companyInfo.name, this.margin, y);
    
    y += 15;

    doc.fontSize(9)
       .font('Helvetica')
       .text(this.companyInfo.address, this.margin, y, { width: 250 });
    
    y += 12;
    doc.text(`${this.companyInfo.city}, ${this.companyInfo.state} - ${this.companyInfo.pincode}`, this.margin, y);
    
    y += 12;
    doc.text(`Phone: ${this.companyInfo.phone}`, this.margin, y);

    // To (Customer Address) - Right side with box
    y = this.margin + 35;
    const toX = this.pageWidth / 2 + 10;
    const boxWidth = (this.pageWidth - this.margin - toX);
    const boxHeight = 140;

    // Draw box around customer address
    doc.strokeColor('#d4af37')
       .lineWidth(2)
       .rect(toX, y, boxWidth, boxHeight)
       .stroke();

    y += 10;
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text('TO:', toX + 10, y);
    
    y += 18;

    doc.fontSize(12)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(order.customer_name.toUpperCase(), toX + 10, y, { width: boxWidth - 20 });
    
    y += 18;

    doc.fontSize(10)
       .font('Helvetica')
       .text(order.delivery_address, toX + 10, y, { width: boxWidth - 20 });
    
    y += (order.delivery_address.length > 50 ? 30 : 18);

    doc.text(`${order.city} - ${order.pincode}`, toX + 10, y);
    
    if (order.landmark) {
      y += 15;
      doc.fontSize(9)
         .fillColor('#666666')
         .text(`Landmark: ${order.landmark}`, toX + 10, y, { width: boxWidth - 20 });
    }
    
    y += 15;
    doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(`Phone: ${order.customer_phone}`, toX + 10, y);

    // Order details at bottom of delivery slip
    y = this.halfHeight - 80;
    
    doc.strokeColor('#cccccc')
       .lineWidth(1)
       .moveTo(this.margin, y)
       .lineTo(this.pageWidth - this.margin, y)
       .stroke();
    
    y += 15;

    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica')
       .text('Order Number:', this.margin, y);
    
    doc.fillColor('#000000')
       .font('Helvetica-Bold')
       .text(order.order_number, this.margin + 100, y);

    doc.fillColor('#666666')
       .font('Helvetica')
       .text('Order Date:', this.pageWidth / 2, y);
    
    doc.fillColor('#000000')
       .font('Helvetica-Bold')
       .text(new Date(order.created_at).toLocaleDateString('en-IN'), this.pageWidth / 2 + 80, y);

    y += 15;

    doc.fillColor('#666666')
       .font('Helvetica')
       .text('Payment:', this.margin, y);
    
    const paymentStatus = order.payment_status === 'completed' ? 'PAID' : 'COD';
    doc.fillColor(paymentStatus === 'PAID' ? '#28a745' : '#ffc107')
       .font('Helvetica-Bold')
       .text(paymentStatus, this.margin + 100, y);

    doc.fillColor('#666666')
       .font('Helvetica')
       .text('Amount:', this.pageWidth / 2, y);
    
    doc.fillColor('#d4af37')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(`₹${order.total_amount}`, this.pageWidth / 2 + 80, y);
  }

  /**
   * Draw invoice (bottom half)
   */
  drawInvoice(doc, order, items) {
    let y = this.halfHeight + this.margin;
    const contentWidth = this.pageWidth - (this.margin * 2);

    // Invoice header
    doc.fontSize(20)
       .fillColor('#d4af37')
       .font('Helvetica-Bold')
       .text('INVOICE', this.margin, y);
    
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`#${order.order_number}`, this.pageWidth - this.margin - 100, y + 5, {
         width: 100,
         align: 'right'
       });

    y += 35;

    // Company and customer info side by side
    // Left: Company
    doc.fontSize(9)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(this.companyInfo.name, this.margin, y);
    
    y += 12;
    doc.fontSize(8)
       .font('Helvetica')
       .text(this.companyInfo.address, this.margin, y, { width: 200 });
    
    y += 10;
    doc.text(`${this.companyInfo.city}, ${this.companyInfo.state}`, this.margin, y);
    
    y += 10;
    doc.text(`Phone: ${this.companyInfo.phone}`, this.margin, y);

    // Right: Customer
    y = this.halfHeight + this.margin + 35;
    const customerX = this.pageWidth / 2 + 20;
    
    doc.fontSize(8)
       .fillColor('#666666')
       .text('BILL TO:', customerX, y);
    
    y += 12;
    doc.fontSize(9)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(order.customer_name, customerX, y, { width: 200 });
    
    y += 12;
    doc.fontSize(8)
       .font('Helvetica')
       .text(order.delivery_address, customerX, y, { width: 200 });
    
    y += (order.delivery_address.length > 40 ? 20 : 12);
    doc.text(`${order.city} - ${order.pincode}`, customerX, y);
    
    y += 12;
    doc.text(`Phone: ${order.customer_phone}`, customerX, y);

    // Invoice details
    y = this.halfHeight + this.margin + 110;
    
    doc.fontSize(8)
       .fillColor('#666666')
       .text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, this.margin, y);
    
    doc.text(`Payment: ${order.payment_status === 'completed' ? 'PAID' : 'COD'}`, this.pageWidth - this.margin - 100, y, {
      width: 100,
      align: 'right'
    });

    // Items table
    y += 25;
    
    // Table header
    doc.fillColor('#d4af37')
       .rect(this.margin, y, contentWidth, 20)
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('ITEM', this.margin + 5, y + 6, { width: 250 })
       .text('QTY', this.margin + 260, y + 6, { width: 50, align: 'center' })
       .text('PRICE', this.margin + 320, y + 6, { width: 80, align: 'right' })
       .text('TOTAL', this.margin + 410, y + 6, { width: 100, align: 'right' });

    y += 20;

    // Table rows
    doc.fillColor('#000000')
       .font('Helvetica');

    items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
      doc.fillColor(bgColor)
         .rect(this.margin, y, contentWidth, 18)
         .fill();
      
      doc.fillColor('#000000')
         .fontSize(9)
         .text(item.product_name, this.margin + 5, y + 5, { width: 250 })
         .text(item.quantity.toString(), this.margin + 260, y + 5, { width: 50, align: 'center' })
         .text(`₹${item.unit_price}`, this.margin + 320, y + 5, { width: 80, align: 'right' })
         .text(`₹${item.total_price}`, this.margin + 410, y + 5, { width: 100, align: 'right' });
      
      y += 18;
    });

    // Totals section
    y += 10;
    const totalsX = this.pageWidth - this.margin - 200;

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Subtotal:', totalsX, y)
       .fillColor('#000000')
       .text(`₹${order.subtotal}`, totalsX + 100, y, { width: 100, align: 'right' });

    y += 15;
    doc.fillColor('#666666')
       .text('Delivery Charges:', totalsX, y)
       .fillColor('#000000')
       .text(`₹${order.delivery_charge}`, totalsX + 100, y, { width: 100, align: 'right' });

    y += 15;
    doc.strokeColor('#d4af37')
       .lineWidth(1)
       .moveTo(totalsX, y)
       .lineTo(this.pageWidth - this.margin, y)
       .stroke();

    y += 10;
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#d4af37')
       .text('Total Amount:', totalsX, y)
       .text(`₹${order.total_amount}`, totalsX + 100, y, { width: 100, align: 'right' });

    // Footer
    y = this.pageHeight - this.margin - 30;
    
    doc.fontSize(8)
       .fillColor('#999999')
       .font('Helvetica')
       .text('Thank you for your order!', this.margin, y, {
         width: contentWidth,
         align: 'center'
       });
    
    y += 12;
    doc.text(this.companyInfo.email, this.margin, y, {
      width: contentWidth,
      align: 'center'
    });
  }

  /**
   * Update company information
   */
  setCompanyInfo(companyInfo) {
    this.companyInfo = { ...this.companyInfo, ...companyInfo };
  }
}

export default new PDFService();

