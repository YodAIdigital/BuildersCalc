import { type CabinConfig } from '../lib/cabin';

export type CabinEmailOptions = {
  title?: string; // Heading within the HTML body (defaults to 'Cabin Estimate')
  logoDataUri?: string; // data:image/png;base64,... for email reliability
  businessName?: string; // Defaults to 'Roots & Echo Ltd'
  phone?: string; // Defaults to '021 180 1218'
  email?: string; // Defaults to 'zeke@rootsandecho.co.nz'
};

export function renderCabinEmailHTML(
  config: CabinConfig,
  result: {
    items: { category: string; name: string; unit: string; qty: number; rate: number; subtotal: number }[];
    totals: { exGst: number; gst: number; inclGst: number };
    warnings: string[];
  },
  opts: CabinEmailOptions = {}
): string {
  const title = opts.title || 'Cabin Estimate';
  const businessName = opts.businessName || 'Roots & Echo Ltd';
  const phone = opts.phone || '021 180 1218';
  const email = opts.email || 'zeke@rootsandecho.co.nz';
  const logo = opts.logoDataUri || '';

  const rows = result.items
    .map(
      (it) =>
        `<tr>
          <td style="padding:4px;border-bottom:1px solid #eee;">${escapeHtml(it.category)}</td>
          <td style="padding:4px;border-bottom:1px solid #eee;">${escapeHtml(it.name)}</td>
          <td style="padding:4px;border-bottom:1px solid #eee;">${it.unit}</td>
          <td style="padding:4px;border-bottom:1px solid #eee;text-align:right">${it.qty}</td>
          <td style="padding:4px;border-bottom:1px solid #eee;text-align:right">$${it.rate}</td>
          <td style="padding:4px;border-bottom:1px solid #eee;text-align:right;font-weight:600">$${it.subtotal}</td>
        </tr>`
    )
    .join('');

  const cfg = `
    <table style="width:100%;border-collapse:collapse;margin:8px 0" cellspacing="0" cellpadding="0">
      <tbody>
        <tr><td style="padding:4px;width:160px;color:#475569">Dimensions</td><td style="padding:4px">${config.length} x ${config.width} x ${config.height} mm</td></tr>
        <tr><td style="padding:4px;color:#475569">Roof</td><td style="padding:4px">${config.roofType}${config.roofType !== 'flat' ? ` @ ${config.pitchDeg}°` : ''}, overhang ${config.overhang} mm${config.includeOverhangInArea ? ' (included in area)' : ''}</td></tr>
        <tr><td style="padding:4px;color:#475569">Spacings</td><td style="padding:4px">Stud ${config.studSpacing} mm, Nog ${config.nogSpacing} mm, Rafter ${config.rafterSpacing} mm, Joist ${config.joistSpacing} mm, Bearer ${config.bearerSpacing} mm, Pile ${config.pileSpacing} mm</td></tr>
        <tr><td style="padding:4px;color:#475569">Cladding</td><td style="padding:4px">${escapeHtml(String(config.exteriorCladding))}</td></tr>
        <tr><td style="padding:4px;color:#475569">Lining</td><td style="padding:4px">${config.lining}${config.lining !== 'none' && config.insulated ? ' + insulated' : ''}</td></tr>
        <tr><td style="padding:4px;color:#475569">Openings</td><td style="padding:4px">Doors ${config.openings.doors.reduce((a,d)=>a+d.count,0)}, Windows ${config.openings.windows.reduce((a,w)=>a+w.count,0)}</td></tr>
      </tbody>
    </table>`;

  const brandBlock = `
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin-bottom:12px">
      <tbody>
        <tr>
          <td style="vertical-align:middle;padding:0;margin:0;width:64px">
            ${logo ? `<img src="${logo}" alt="${escapeHtml(businessName)} logo" style="height:48px;width:auto;display:block;border:0;outline:0;" />` : ''}
          </td>
          <td style="vertical-align:middle;padding:0 0 0 8px">
            <div style="font-weight:700;color:#0f172a">${escapeHtml(businessName)}</div>
            <div style="font-size:12px;color:#334155">${escapeHtml(phone)} • ${escapeHtml(email)}</div>
          </td>
        </tr>
      </tbody>
    </table>`;

  return `
    <div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.45;color:#0f172a">
      ${brandBlock}
      <h2 style="margin:8px 0 8px 0;font-size:20px;line-height:1.2">${escapeHtml(title)}</h2>
      <div style="margin:0 0 6px 0;font-weight:600;color:#334155">Configuration</div>
      ${cfg}
      <table style="width:100%;border-collapse:collapse;margin-top:8px" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:4px;color:#334155">Category</th>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:4px;color:#334155">Item</th>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:4px;color:#334155">Unit</th>
            <th style="text-align:right;border-bottom:1px solid #ddd;padding:4px;color:#334155">Qty</th>
            <th style="text-align:right;border-bottom:1px solid #ddd;padding:4px;color:#334155">Rate</th>
            <th style="text-align:right;border-bottom:1px solid #ddd;padding:4px;color:#334155">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="4"></td><td style="text-align:right;padding:4px;color:#334155">Subtotal (ex GST)</td><td style="text-align:right;padding:4px;font-weight:700">$${result.totals.exGst}</td></tr>
          <tr><td colspan="4"></td><td style="text-align:right;padding:4px;color:#334155">GST</td><td style="text-align:right;padding:4px;font-weight:700">$${result.totals.gst}</td></tr>
          <tr><td colspan="4"></td><td style="text-align:right;padding:4px;color:#334155">Total (incl GST)</td><td style="text-align:right;padding:4px;font-weight:800">$${result.totals.inclGst}</td></tr>
        </tfoot>
      </table>
      <p style="margin-top:12px;color:#475569;font-size:12px">This is an estimate only. Please confirm exact pricing before placing your order.</p>
    </div>
  `;
}

export function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
