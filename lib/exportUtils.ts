import { Order, Product, UserProfile, CustomerAddress, StoreProfile } from './types';
import { formatCurrency, formatDate } from './utils';

export function compressImageFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const valString = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${valString.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printOrderInvoice(order: Order, storeProfile: StoreProfile) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups to print order invoice.');
    return;
  }

  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">
        <strong>${item.product_name}</strong><br/>
        <small style="color: #64748B;">SKU: ${item.sku}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right;">${formatCurrency(item.purchased_price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: bold;">${formatCurrency(item.item_total)}</td>
    </tr>
  `
    )
    .join('');

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TAX INVOICE - #${order.order_number}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0F172A; padding: 30px; margin: 0; font-size: 13px; line-height: 1.5; }
          .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 20px; }
          .brand-title { font-size: 22px; font-weight: bold; color: #122C24; font-family: Georgia, serif; }
          .badge { background: #F3E9C6; color: #754B0E; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }
          .grid-2 { display: flex; justify-content: space-between; margin-bottom: 25px; }
          .box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 10px; width: 46%; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #0F172A; color: #D4AF37; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
          .totals { margin-top: 20px; text-align: right; font-size: 14px; }
          .grand-total { font-size: 18px; color: #B8860B; font-weight: bold; }
          .footer-note { text-align: center; margin-top: 40px; color: #64748B; font-size: 11px; border-top: 1px solid #E2E8F0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div className="invoice-header">
          <div>
            <div class="brand-title">${storeProfile.store_name}</div>
            <div style="color: #64748B;">${storeProfile.address}, ${storeProfile.city}, ${storeProfile.state} - ${storeProfile.pincode}</div>
            <div style="color: #64748B;">Phone: ${storeProfile.phone} | GSTIN: 36AAACS9981D1ZA</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">OFFICIAL TAX INVOICE</span>
            <h2 style="margin: 5px 0 0 0; font-size: 18px;">INVOICE #${order.order_number}</h2>
            <small style="color: #64748B;">Date: ${formatDate(order.created_at)}</small>
          </div>
        </div>

        <div class="grid-2">
          <div class="box">
            <h4 style="margin: 0 0 8px 0; color: #B8860B; text-transform: uppercase; font-size: 11px;">Billed & Shipped To</h4>
            <strong>${order.customer_name}</strong><br/>
            ${order.delivery_address?.address_line1 || ''}<br/>
            ${order.delivery_address?.city || ''}, ${order.delivery_address?.state || ''} - ${order.delivery_address?.pincode || ''}<br/>
            Phone: ${order.customer_phone}<br/>
            Email: ${order.customer_email}
          </div>

          <div class="box">
            <h4 style="margin: 0 0 8px 0; color: #B8860B; text-transform: uppercase; font-size: 11px;">Payment & Delivery Info</h4>
            Payment Method: <strong>${order.payment_method}</strong><br/>
            Payment Status: <strong>${order.payment_status}</strong><br/>
            Order Status: <strong>${order.order_status}</strong><br/>
            Courier Partner: ${order.delivery_details?.courier_name || 'Standard Express'}<br/>
            AWB Tracking #: ${order.delivery_details?.tracking_number || 'Pending'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div>Subtotal: ${formatCurrency(order.subtotal)}</div>
          ${order.discount_amount > 0 ? `<div style="color: #059669;">Discount: -${formatCurrency(order.discount_amount)}</div>` : ''}
          <div>Shipping Fee: ${order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</div>
          <div class="grand-total">Total Invoice Amount: ${formatCurrency(order.total_amount)}</div>
          <small style="color: #64748B;">(Includes 3% GST on Fine Jewellery)</small>
        </div>

        <div class="footer-note">
          Thank you for choosing ${storeProfile.store_name}. For support, call ${storeProfile.phone} or email ${storeProfile.email}.<br/>
          This is a computer-generated tax invoice. No signature required.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
}
