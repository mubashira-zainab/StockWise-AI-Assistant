/**
 * Vercel Serverless Function: /api/export/csv
 */

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body || {};
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data array provided.' });
    }

    let csvContent = '';
    if (type === 'inventory') {
      csvContent += 'Product ID,SKU,Product Name,Category,Description,Purchase Price,Selling Price,Available Quantity,Min Stock Level,Supplier,Date Added\n';
      data.forEach((p: any) => {
        csvContent += `"${p.id}","${p.sku}","${(p.name || '').replace(/"/g, '""')}","${p.category}","${(p.description || '').replace(/"/g, '""')}",${p.costPrice || p.purchasePrice},${p.sellingPrice},${p.stockQuantity || p.quantity},${p.minStockLevel},"${(p.supplier || '').replace(/"/g, '""')}","${p.lastRestocked || p.dateAdded}"\n`;
      });
    } else if (type === 'sales') {
      csvContent += 'Transaction ID,Date,Product Name,SKU,Quantity,Unit Price,Unit Cost,Total Revenue,Total Cost,Total Profit,Profit Margin (%),Customer,Payment Method\n';
      data.forEach((s: any) => {
        csvContent += `"${s.id}","${s.date}","${(s.productName || '').replace(/"/g, '""')}","${s.sku}",${s.quantity},${s.unitPrice},${s.unitCost},${s.totalRevenue},${s.totalCost},${s.profit},${s.profitMargin},"${(s.customer || '').replace(/"/g, '""')}","${s.paymentMethod}"\n`;
      });
    } else if (type === 'purchases') {
      csvContent += 'Purchase ID,Date,Supplier,Product Name,Quantity,Unit Cost,Total Amount,Status\n';
      data.forEach((pc: any) => {
        csvContent += `"${pc.id}","${pc.date}","${(pc.supplierName || '').replace(/"/g, '""')}","${(pc.productName || '').replace(/"/g, '""')}",${pc.quantity},${pc.unitCost},${pc.totalAmount},"${pc.status}"\n`;
      });
    } else if (type === 'suppliers') {
      csvContent += 'Supplier ID,Name,Contact Person,Email,Phone,Address,Category,Products Supplied,Total Orders\n';
      data.forEach((sp: any) => {
        csvContent += `"${sp.id}","${(sp.name || '').replace(/"/g, '""')}","${(sp.contactPerson || '').replace(/"/g, '""')}","${sp.email}","${sp.phone}","${(sp.address || '').replace(/"/g, '""')}","${sp.category}",${sp.productsSupplied || 0},${sp.totalOrders || 0}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=stockwise_${type}_export.csv`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
