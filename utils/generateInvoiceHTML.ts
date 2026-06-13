import { saiImageBase64 } from "@/assets/images/uriEncode";
import { InvoiceData } from "@/types/InvoiceTypes";

const toWords = (n: number): string => {
    n = Math.round(n);
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (n === 0) return 'Zero';

    function hw(num: number): string {
        if (num < 20) return a[num];
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
        if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + hw(num % 100) : '');
        if (num < 100000) return hw(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + hw(num % 1000) : '');
        if (num < 10000000) return hw(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + hw(num % 100000) : '');
        return hw(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + hw(num % 10000000) : '');
    }

    return hw(n) + ' Rupees Only';
};

const fmtDate = (d: string): string => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${mn[parseInt(m) - 1]} ${y}`;
};

const fmt = (n: number): string => {
    return '₹' + n.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Added platform parameter defaulting to 'android'
export function generateInvoiceHTML(data: InvoiceData, platform: 'android' | 'ios' = 'android'): string {
    const {
        invoiceNo,
        invoiceDate,
        billToName,
        billToAddress,
        billToGstin,
        billToState,
        billToCode,
        taxMode,
        freight,
        goods
    } = data;

    const formattedDate = fmtDate(invoiceDate);
    const subtotal = goods.reduce((s, g) => s + g.qty * g.rate, 0);
    const taxable = subtotal + freight;
    const taxAmt = Math.round(taxable * 0.18);
    const grandTotal = taxable + taxAmt;
    const words = toWords(grandTotal);

    let rowsHTML = goods.map((g, i) => {
        const amt = (g.qty * g.rate).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return `
      <tr class="item-row">
        <td style="text-align:center">${i + 1}</td>
        <td>${g.desc || ''}</td>
        <td style="text-align:center">${g.hsn || ''}</td>
        <td style="text-align:right">${g.qty || ''}</td>
        <td style="text-align:right">${g.rate ? '₹' + g.rate.toFixed(2) : ''}</td>
        <td style="text-align:right">${g.qty && g.rate ? '₹' + amt : ''}</td>
      </tr>
    `;
    }).join('');

    const MIN_ROWS = 8;
    if (goods.length < MIN_ROWS) {
        for (let i = goods.length; i < MIN_ROWS; i++) {
            rowsHTML += `
        <tr class="item-row filler-row">
          <td style="text-align:center">${i + 1}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `;
        }
    }

    let taxRows = '';
    if (taxMode === 'IGST') {
        taxRows = `<tr><td style="border:1px solid #c5cfe8;">IGST @ 18%</td><td style="text-align:right; border:1px solid #c5cfe8;">${fmt(taxAmt)}</td></tr>`;
    } else {
        const half = Math.round(taxAmt / 2);
        taxRows = `
      <tr><td style="border:1px solid #c5cfe8;">CGST @ 9%</td><td style="text-align:right; border:1px solid #c5cfe8;">${fmt(half)}</td></tr>
      <tr><td style="border:1px solid #c5cfe8;">SGST @ 9%</td><td style="text-align:right; border:1px solid #c5cfe8;">${fmt(half)}</td></tr>
    `;
    }

    const isIOS = platform === 'ios';

    return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11.5px;
      line-height: 1.4;
      color: #1a1a2e;
      padding: 24px;
      background: #fff;
      position: relative;
      
      /* FIX: Forces iOS WebKit to render backgrounds when printing/generating PDFs */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Platform-specific styling for the Watermark */
    ${isIOS ? `
    .watermark {
      position: absolute;
      top: 35%;
      left: 50%;
      width: 460px;
      margin-left: -230px; /* Centers perfectly on iOS without transform bugs */
      pointer-events: none;
      z-index: 999;        /* Moves it safely behind content layers */
      opacity: 0.1;
    }
    ` : `
    .watermark {
      position: fixed;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 460px;
      color: rgba(26, 58, 110, 0.05);
      font-family: Georgia, serif;
      pointer-events: none;
      z-index: 0;
      user-select: none;
      line-height: 1;
    }
    `}

    .content { position: relative; z-index: 1; }
    .om-sai { font-size: 12px; font-weight: bold; color: #1a3a6e; font-family: 'Comic Sans MS', cursive; margin-bottom: 4px; }
    
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .brand-name { margin-bottom: 3px; font-size: 24px; font-weight: bold; color: #1a3a6e; font-family: Georgia, serif; }
    .brand-sub { font-size: 11px; font-style: italic; color: #555; margin: 3px 0; }
    .brand-contact { font-size: 11px; color: #333; margin-top: 4px; }
    .tax-inv { font-size: 16px; font-weight: bold; color: #1a3a6e; text-decoration: underline; text-align: right; }
    .gstin-pan { font-size: 11px; color: #1a3a6e; font-weight: bold; text-align: right; margin-top: 3px; }

    table.info { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    table.info td { border: 1px solid #1f283c; padding: 7px 10px; vertical-align: top; }
    .lbl { font-size: 12px; font-weight: 400; color: #1a1a2e; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .03em; }
    .val { font-size: 12px; font-weight: 600; color: #1a1a2e; }
    
    .section-title { font-size: 11px; font-weight: bold; color: #1a3a6e; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1.5px solid #1a3a6e; padding-bottom: 4px; margin: 16px 0 6px; }

    table.goods { width: 100%; border-collapse: collapse; margin: 10px 0; }
    table.goods th { background: #1a3a6e; color: #fff; padding: 8px 10px; font-size: 11.5px; text-align: left; }
    table.goods th.r, table.goods td.r { text-align: right; }
    table.goods th.c, table.goods td.c { text-align: center; }
    
    .item-row td { padding: 7px 10px; border: 1px solid #1f283c; height: 30px; vertical-align: middle; font-size: 11.5px; }
    
    /* FIX: iOS often struggles with ultra-low alpha values in table elements. Using solid hex for iOS. */
    table.goods tr:nth-child(even) td { 
      background: ${isIOS ? '#f4f6fb' : 'rgba(26, 58, 110, 0.02)'}; 
    }
    
    .filler-row td { color: transparent; }

    .words-label { font-size: 10px; color: #1a1a2e; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
    .words-val { font-size: 13px; font-weight: bold; color: #1a3a6e; line-height: 1.35; }
    
    table.totals { width: 100%; border-collapse: collapse; }
    table.totals td { padding: 7px 10px; border: 1px solid #1f283c; font-size: 11.5px; height: 28px; }
    table.totals .grand { background: #1a3a6e; color: #fff; font-size: 11.5px; font-weight: bold; }

    .terms { font-size: 11px; color: #444; line-height: 1.5; }
    .terms-title { font-weight: bold; font-size: 11px; text-decoration: underline; margin-bottom: 5px; color: #1a3a6e; }
    .sign-area { text-align: right; font-size: 11px; color: #555; }
    .sign-line { border-top: 1px solid #333; width: 180px; margin-left: auto; padding-top: 5px; margin-top: 45px; text-align: center; }
  </style>
</head>
<body>

  <img class="watermark" src="data:image/png;base64, ${saiImageBase64}" alt="">

  <div class="content">
    <div class="om-sai">Om Sai</div>
    <div class="header-top">
      <div>
        <div class="brand-name">Switch Technology India</div>
        <div class="brand-sub">Mfrs. of all kinds of Rotary Switches &amp; Potentiometers</div>
        <div class="brand-contact">20/4, Mathura Road, NEPCO Compound, Faridabad &nbsp;|&nbsp; Mobile: 9810643288</div>
      </div>
      <div>
        <div class="tax-inv">TAX INVOICE</div>
        <div class="gstin-pan">GSTIN: 06AECPJ3667C1ZT</div>
        <div class="gstin-pan">PAN: AECPJ3667C</div>
      </div>
    </div>

    <table class="info" style="margin-top:10px">
      <tr>
        <td style="width:25%"><span class="lbl">Invoice No.</span><span class="val">${invoiceNo}</span></td>
        <td style="width:25%"><span class="lbl">Invoice Date</span><span class="val">${formattedDate}</span></td>
        <td style="width:35%"><span class="lbl">State</span><span class="val">Haryana</span></td>
        <td style="width:15%" nowrap><span class="lbl">State&nbsp;Code</span><span class="val">06</span></td>
      </tr>
    </table>

    <div class="section-title">Bill to party</div>
    <table class="info">
      <tr>
        <td style="width:14%"><span class="lbl">Name</span></td>
        <td colspan="3"><span class="val">${billToName || '&nbsp;'}</span></td>
      </tr>
      <tr>
        <td><span class="lbl">Address</span></td>
        <td colspan="3"><span class="val">${billToAddress || '&nbsp;'}</span></td>
      </tr>
      <tr>
        <td><span class="lbl">GSTIN</span></td>
        <td colspan="3"><span class="val">${billToGstin || '&nbsp;'}</span></td>
      </tr>
      <tr>
        <td><span class="lbl">State</span></td>
        <td style="width:48%"><span class="val">${billToState || '&nbsp;'}</span></td>
        <td style="width:18%" nowrap><span class="lbl">State&nbsp;Code</span></td>
        <td style="width:20%"><span class="val">${billToCode || '&nbsp;'}</span></td>
      </tr>
    </table>

    <table class="goods">
      <thead>
        <tr>
          <th class="c" style="width:5%">#</th>
          <th style="width:45%">Description of goods</th>
          <th class="c" style="width:12%">HSN/ASC code</th>
          <th class="r" style="width:12%">Quantity</th>
          <th class="r" style="width:12%">Rate</th>
          <th class="r" style="width:14%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>

    <table style="width:100%; border-collapse: collapse; margin-top: 8px;">
      <tr>
        <td style="width: 54%; vertical-align: top; background: #eef3fc; border: 1px solid #b0c4de; border-radius: 4px; padding: 12px 14px;">
          <div class="words-label">Total invoice amount in words</div>
          <div class="words-val">${words}</div>
        </td>
        <td style="width: 3%;"></td>
        <td style="width: 43%; vertical-align: top;">
          <table class="totals">
            <tr><td>Freight Charges</td><td style="text-align:right">${fmt(freight)}</td></tr>
            <tr><td>Taxable Amount</td><td style="text-align:right">${fmt(taxable)}</td></tr>
            ${taxRows}
            <tr class="grand"><td>Grand Total After Tax</td><td style="text-align:right">${fmt(grandTotal)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
      <tr>
        <td style="width: 54%; vertical-align: top;">
          <div class="terms">
            <div class="terms-title">Terms &amp; conditions</div>
            <div>1. Payment immediately within one week.</div>
            <div>2. Goods once sold will not be taken back.</div>
            <div>3. All disputes subject to Faridabad Jurisdiction only.</div>
            <div style="margin-top:5px; color:#777; font-style: italic;">E.&amp;O.E.</div>
          </div>
        </td>
        <td style="width: 3%;"></td>
        <td style="width: 43%; vertical-align: bottom;">
          <div class="sign-area">
            <div>for <strong>Switch Technology India</strong></div>
            <div class="sign-line">
              <div style="font-weight:bold; color: #1a3a6e;">Authorised Signatory</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>
  `;
}