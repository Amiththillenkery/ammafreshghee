# 📝 How to Update Company Information in PDFs

## Quick Update

To customize the company information that appears on your PDFs:

### Step 1: Open the PDF Service File

Open this file in your editor:
```
admin-panel/pdfService.js
```

### Step 2: Find the Company Info Section

Look for this code (around line 15-26):

```javascript
this.companyInfo = {
  name: 'Amma Fresh Ghee',
  address: 'Your Shop Address',
  city: 'Your City',
  state: 'Your State',
  pincode: '560001',
  phone: '+91-XXXXXXXXXX',
  email: 'contact@ammafreshghee.com',
  gst: 'GST No: XXXXXXXXXXXX'
};
```

### Step 3: Update Your Information

Replace with your actual details:

```javascript
this.companyInfo = {
  name: 'Amma Fresh Ghee',                    // Your company/shop name
  address: '123, MG Road, Koramangala',       // Complete street address
  city: 'Bangalore',                          // City name
  state: 'Karnataka',                         // State name
  pincode: '560034',                          // Your pincode
  phone: '+91-9876543210',                    // Contact number
  email: 'orders@ammafreshghee.com',          // Business email
  gst: 'GST No: 29XXXXX1234X1Z5'            // GST number (if applicable)
};
```

### Step 4: Save and Restart

1. **Save** the file (Ctrl+S / Cmd+S)
2. **Stop** the server (Ctrl+C in terminal)
3. **Restart** the server:
   ```bash
   npm start
   ```

### Step 5: Test

1. Generate a PDF from any order
2. Check if your information appears correctly
3. If not, repeat steps above

---

## Field Guide

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| `name` | Your business name | "Amma Fresh Ghee" | ✅ Yes |
| `address` | Street address | "123, MG Road, Koramangala" | ✅ Yes |
| `city` | City name | "Bangalore" | ✅ Yes |
| `state` | State name | "Karnataka" | ✅ Yes |
| `pincode` | Postal code | "560034" | ✅ Yes |
| `phone` | Contact number with country code | "+91-9876543210" | ✅ Yes |
| `email` | Business email | "orders@ammafresh.com" | ✅ Yes |
| `gst` | GST number (for invoices) | "GST No: 29XXXXX1234X1Z5" | ⚠️ Optional |

---

## Tips

### For GST Number
- If you have GST registration, add your 15-digit GSTIN
- Format: `GST No: 29XXXXX1234X1Z5`
- If you don't have GST, you can:
  - Remove the line completely, OR
  - Change it to: `gst: 'Business Registration: XXXXXX'`

### For Long Addresses
- If your address is long, split it into multiple lines in the `address` field:
  ```javascript
  address: '123, Ground Floor, MG Road\nKoramangala, Near Cafe'
  ```
- Use `\n` to create line breaks

### For Multiple Locations
- Use your primary/head office address
- This appears as the "return address" on delivery slips
- Customers will see this as the sender address

---

## Formatting Examples

### Example 1: Regular Shop
```javascript
this.companyInfo = {
  name: 'Amma Fresh Ghee',
  address: 'Shop No. 45, Gandhi Bazaar',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560004',
  phone: '+91-9876543210',
  email: 'orders@ammafreshghee.com',
  gst: 'GST No: 29AABCA1234A1Z5'
};
```

### Example 2: Home-based Business
```javascript
this.companyInfo = {
  name: 'Amma Fresh Ghee',
  address: 'No. 234, 2nd Cross, Jayanagar 4th Block',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560011',
  phone: '+91-9876543210',
  email: 'ammafreshghee@gmail.com',
  gst: 'Proprietorship: Not Registered'
};
```

### Example 3: Multi-line Address
```javascript
this.companyInfo = {
  name: 'Amma Fresh Ghee',
  address: 'No. 123, Ground Floor\nRK Complex, MG Road',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
  phone: '+91-9876543210',
  email: 'contact@ammafreshghee.com',
  gst: 'GST No: 29AABCA1234A1Z5'
};
```

---

## Verification Checklist

After updating, verify:

- [ ] Company name appears correctly
- [ ] Address is complete and readable
- [ ] Phone number is correct with +91 prefix
- [ ] Email is correct
- [ ] City and state are spelled correctly
- [ ] Pincode is accurate
- [ ] GST number is valid (if applicable)
- [ ] No typos or formatting issues

---

## Troubleshooting

### Information not updating
1. Make sure you saved the file
2. Restart the server (Ctrl+C, then `npm start`)
3. Clear browser cache and reload
4. Generate a fresh PDF

### Text overflowing or cut off
1. Keep address under 100 characters
2. Use shorter company names if possible
3. Split long addresses with `\n`

### Special characters not showing
1. Avoid special symbols in address
2. Use standard characters only
3. For symbols like & use "and" instead

---

## Need Help?

If you're having trouble:
1. Check the server logs for errors
2. Verify JSON syntax (commas, quotes)
3. Make sure all fields have values
4. Test with a simple address first

---

**File Location:** `admin-panel/pdfService.js`  
**Lines to Edit:** ~15-26  
**Restart Required:** Yes

