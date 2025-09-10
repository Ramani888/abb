import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
export const generateRetailInvoicePdfBytes = async (orderData?: any) => {
    try {
        // Sample order data if none provided
        const staticOrderData = {
            _id: 'sample123456',
            invoiceNumber: 'INV-2023-001',
            captureDate: new Date().toISOString(),
            total: 1500.00,
            subTotal: 1271.19,
            totalGst: 228.81,
            roundOff: 0,
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            customerData: {
                name: 'Sample Customer',
                address: '123 Sample Street, Sample City - 380001',
                mobile: '9876543210'
            },
            products: [
                {
                    productId: 'prod1',
                    productData: {
                        name: 'Fertilizer A',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12345'
                    },
                    variantData: {
                        packingSize: '10kg'
                    },
                    price: 550.00,
                    quantity: 2,
                    total: 1100.00
                },
                {
                    productId: 'prod2',
                    productData: {
                        name: 'Fertilizer B',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12346'
                    },
                    variantData: {
                        packingSize: '20kg'
                    },
                    price: 950.00,
                    quantity: 1,
                    total: 950.00
                },
                {
                    productId: 'prod1',
                    productData: {
                        name: 'Fertilizer A',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12345'
                    },
                    variantData: {
                        packingSize: '10kg'
                    },
                    price: 550.00,
                    quantity: 2,
                    total: 1100.00
                },
                {
                    productId: 'prod2',
                    productData: {
                        name: 'Fertilizer B',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12346'
                    },
                    variantData: {
                        packingSize: '20kg'
                    },
                    price: 950.00,
                    quantity: 1,
                    total: 950.00
                },
                {
                    productId: 'prod1',
                    productData: {
                        name: 'Fertilizer A',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12345'
                    },
                    variantData: {
                        packingSize: '10kg'
                    },
                    price: 550.00,
                    quantity: 2,
                    total: 1100.00
                }
            ]
        };

        const order = orderData || staticOrderData;
        
        // Check if order has more than 15 items and return an error message
        if (order.products && order.products.length > 15) {
            throw new Error("Invoice generation failed: Maximum 15 product items allowed per invoice.");
        }
        
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;

        // Layout constants
        const PAGE_WIDTH = 800;
        const PAGE_HEIGHT = 1000;
        const MARGIN_X = 50;
        const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_X * 2);
        const HEADER_HEIGHT = 280;
        const FOOTER_HEIGHT = 220;
        const FOOTER_HEIGHT_REGULAR = 50;
        const ITEM_HEIGHT = 25;
        const TABLE_HEADER_HEIGHT = 20;
        
        // Fixed number of items per invoice
        const MAX_ITEMS = 15;
        // Fixed table height for 15 items
        const FIXED_TABLE_HEIGHT = MAX_ITEMS * ITEM_HEIGHT + TABLE_HEADER_HEIGHT;

        // Define colors
        const greenBackground = rgb(0.24, 0.35, 0.26); // Dark green color (converted from 61,89,67)
        const whiteText = rgb(1, 1, 1); // White text
        const blackText = rgb(0, 0, 0); // Black text

        // Helper functions
        const createPageHeader = (page: any, pageNumber: number, totalPages: number) => {
            page.drawRectangle({
                x: MARGIN_X,
                y: 50,
                width: CONTENT_WIDTH,
                height: PAGE_HEIGHT - 100,
                color: rgb(1, 1, 1)
            });
            
            // Green background for header section
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 150,
                width: CONTENT_WIDTH,
                height: 100,
                color: whiteText, // Dark green color
            });
            
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 140,
                width: 80,
                height: 80,
                color: rgb(0.95, 0.95, 0.95),
            });
            
            page.drawText('RETAIL INVOICE', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 105,
                size: 14,
                font: timesBoldFont,
                color: blackText, // White text
            });
            
            page.drawText('SARTHI AGROTECH', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 80,
                size: 24,
                font: timesBoldFont,
                color: blackText, // White text
            });

            //company address set right side top corner
            const companyAddress = '123 Pharmacy Street, Medical District, City - 380001';
            const companyAddressWidth = timesRomanFont.widthOfTextAtSize(companyAddress, 10);
            page.drawText(companyAddress, {
                x: PAGE_WIDTH - companyAddressWidth - 60,
                y: PAGE_HEIGHT - 70,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // mobile number set below company address
            const companyMobileNumber = 'Mobile: +91 9876543210';
            const companyMobileNumberWidth = timesRomanFont.widthOfTextAtSize(companyMobileNumber, 10);

            page.drawText(companyMobileNumber, {
                x: PAGE_WIDTH - companyMobileNumberWidth - 60,
                y: PAGE_HEIGHT - 85,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // gst number set below mobile number
            const companyGSTNumber = 'GST No: 24ABCDE1234F1Z5';
            const companyGSTNumberWidth = timesRomanFont.widthOfTextAtSize(companyGSTNumber, 10);
            page.drawText(companyGSTNumber, {
                x: PAGE_WIDTH - companyGSTNumberWidth - 60,
                y: PAGE_HEIGHT - 100,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // drug license set below gst number
            const companyDrugLicense = 'Drug License: GJ-12345';
            const companyDrugLicenseWidth = timesRomanFont.widthOfTextAtSize(companyDrugLicense, 10);
            page.drawText(companyDrugLicense, {
                x: PAGE_WIDTH - companyDrugLicenseWidth - 60,
                y: PAGE_HEIGHT - 115,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // Invoice details and customer info
            // Background color for the invoice details section
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 250,
                width: CONTENT_WIDTH,
                height: 50,
                color: whiteText, // Dark green color
            });
            
            page.drawText(`Invoice #: ${order.invoiceNumber || 'INV-2023-001'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 170,
                size: 12,
                font: timesRomanFont,
                color: blackText, // Black text for this section
            });
            
            const orderDate = order.captureDate ? new Date(order.captureDate).toLocaleDateString() : new Date().toLocaleDateString();
            page.drawText('Date: ' + orderDate, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 190,
                size: 12,
                font: timesRomanFont,
                color: blackText, // Black text for this section
            });
            
            page.drawText('Bill To:', {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 220,
                size: 12,
                font: timesBoldFont,
                color: blackText, // White text
            });
            
            page.drawText(`Name: ${order.customerData?.name || 'Customer Name'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            const customerAddress = order.customerData?.address || 'Customer Address';
            const fullCustomerAddress = `Address: ${customerAddress}`;
            const customerAddressWidth = timesRomanFont.widthOfTextAtSize(fullCustomerAddress, 10);
            page.drawText(fullCustomerAddress, {
                x: PAGE_WIDTH / 2 - customerAddressWidth / 2,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            if (order.customerData?.mobile) {
                page.drawText(`Mobile: ${order.customerData.mobile}`, {
                    x: PAGE_WIDTH - 145,
                    y: PAGE_HEIGHT - 240,
                    size: 10,
                    font: timesRomanFont,
                    color: blackText, // White text
                });
            }
            
            return PAGE_HEIGHT - HEADER_HEIGHT;
        };

        const createTableHeaders = (page: any, startY: number, isLastPage: boolean) => {
            // Always use fixed table height for 15 rows
            const tableHeight = FIXED_TABLE_HEIGHT;
            
            // Draw table background (white) - EXCLUDING the header row
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: startY - tableHeight,
                width: CONTENT_WIDTH - 20,
                height: tableHeight - TABLE_HEADER_HEIGHT, // Reduce height to exclude header
                color: rgb(0.95, 0.95, 0.95), // White background for table body
            });
            
            // Draw table header with green background - as a separate rectangle
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: startY - TABLE_HEADER_HEIGHT,
                width: CONTENT_WIDTH - 20,
                height: TABLE_HEADER_HEIGHT,
                color: greenBackground, // Green background for header
            });
            
            // Column positions - redistributed to increase widths after removing one column
            // Adjusted to distribute space more evenly
            const columnPositions = [
                MARGIN_X + 10,        // S.No
                MARGIN_X + 50,        // Product
                MARGIN_X + 230,       // Produce By (increased)
                MARGIN_X + 320,       // Batch No. (increased)
                MARGIN_X + 390,       // Packing (increased)
                MARGIN_X + 480,       // Price (increased)
                MARGIN_X + 550,       // Qty (increased)
                MARGIN_X + 620,       // Amount (increased)
                MARGIN_X + CONTENT_WIDTH - 10 // End edge
            ];
            
            // Draw vertical grid lines for all 15 rows
            for (let i = 0; i < columnPositions.length; i++) {
                page.drawLine({
                    start: { x: columnPositions[i], y: startY },
                    end: { x: columnPositions[i], y: startY - tableHeight },
                    thickness: 1,
                    color: whiteText,
                });
            }
            
            // Draw horizontal grid lines for all 15 rows
            for (let i = 1; i <= MAX_ITEMS; i++) {
                page.drawLine({
                    start: { x: MARGIN_X + 10, y: startY - TABLE_HEADER_HEIGHT - (i * ITEM_HEIGHT) },
                    end: { x: MARGIN_X + CONTENT_WIDTH - 10, y: startY - TABLE_HEADER_HEIGHT - (i * ITEM_HEIGHT) },
                    thickness: 0.5,
                    color: whiteText,
                });
            }
            
            // Draw column headers with white text - adjusted positions for new column widths
            const headerY = startY - 15;
            const fontSize = 10;
            page.drawText('S.No', { x: MARGIN_X + 20, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Product', { x: MARGIN_X + 60, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Produce By', { x: MARGIN_X + 240, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Batch No.', { x: MARGIN_X + 330, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Packing', { x: MARGIN_X + 400, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Price', { x: MARGIN_X + 490, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Qty', { x: MARGIN_X + 560, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Amount', { x: MARGIN_X + 630, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            
            return {
                startY,
                tableHeight,
                columnPositions,
                maxItems: MAX_ITEMS,
                footerHeight: isLastPage ? FOOTER_HEIGHT : FOOTER_HEIGHT_REGULAR
            };
        };

        const drawItem = (page: any, item: any, index: number, rowIndex: number, tableInfo: any) => {
            const fontSize = 10;
            const itemY = tableInfo.startY - TABLE_HEADER_HEIGHT - (rowIndex + 1) * ITEM_HEIGHT + 5;
            const itemNo = index + 1;
            const itemName = item.productData?.name || 'Unknown Product';
            const manufacturer = item.productData?.manufacturer || 'Unknown';
            const batchNo = item.productData?.batchNo || '-';
            const packingSize = item.variantData?.packingSize || '-';
            const price = item.price || 0;
            const quantity = item.quantity || 0;
            const itemTotal = item.total || (price * quantity);
            
            page.drawText(itemNo.toString(), {
                x: tableInfo.columnPositions[0] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            // Increased maximum lengths to take advantage of wider columns
            const maxNameLength = 30;
            const displayName = itemName.length > maxNameLength
                ? itemName.substring(0, maxNameLength) + '...'
                : itemName;
            page.drawText(displayName, {
                x: tableInfo.columnPositions[1] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            const maxMfgLength = 20;
            const displayMfg = manufacturer.length > maxMfgLength
                ? manufacturer.substring(0, maxMfgLength) + '...'
                : manufacturer;
            page.drawText(displayMfg, {
                x: tableInfo.columnPositions[2] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(batchNo, {
                x: tableInfo.columnPositions[3] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(packingSize, {
                x: tableInfo.columnPositions[4] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(formatCurrency(price), {
                x: tableInfo.columnPositions[5] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(quantity.toString(), {
                x: tableInfo.columnPositions[6] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(formatCurrency(itemTotal), {
                x: tableInfo.columnPositions[7] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
        };

        // Adjust total row drawing to match the new column positions
        const drawTotalRow = (page: any, items: any[], tableInfo: any) => {
            const fontSize = 10;
            const totalY = tableInfo.startY - TABLE_HEADER_HEIGHT - (MAX_ITEMS * ITEM_HEIGHT) - 15;
            
            // Draw total row background
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: totalY - 5,
                width: CONTENT_WIDTH - 20,
                height: 25,
                color: greenBackground, // Light gray background for total row
            });
            
            // Calculate column-specific totals
            let totalQuantity = 0;
            let totalAmount = 0;
            let totalPrice = 0; // For average price calculation
            
            items.forEach(item => {
                totalQuantity += item.quantity || 0;
                totalAmount += item.total || 0;
                totalPrice += (item.price || 0) * (item.quantity || 0);
            });
            
            // Calculate average price (if needed)
            const avgPrice = totalQuantity > 0 ? (totalPrice / totalQuantity) : 0;
            
            // Draw total row text
            page.drawText("TOTAL", {
                x: tableInfo.columnPositions[1] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
            
            // Draw the average price in Price column (optional)
            page.drawText(formatCurrency(avgPrice), {
                x: tableInfo.columnPositions[5] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
            
            // Draw quantity total
            page.drawText(totalQuantity.toString(), {
                x: tableInfo.columnPositions[6] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
            
            // Draw amount total
            page.drawText(formatCurrency(totalAmount), {
                x: tableInfo.columnPositions[7] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
        };

        const addPageFooter = (page: any, yPosition: number, isLastPage: boolean) => {
            if (isLastPage) {
                const footerY = 170;
                if (order?.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 90,
                        width: 160,
                        height: 25,
                        color: whiteText,
                    });
                    page.drawText('GST:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                    page.drawText(formatCurrency(order.totalGst), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                }
                if (order.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 55,
                        width: 160,
                        height: 25,
                        color: whiteText,
                    });
                    const finalTotal = order.total;
                    page.drawText('Total:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                    page.drawText(formatCurrency(finalTotal), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                }
                if (order.paymentMethod) {
                    page.drawText(`Payment Method: ${order.paymentMethod}`, {
                        x: MARGIN_X + 10,
                        y: footerY + 97,
                        size: 12,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                    });
                    page.drawText(`Payment Status: ${order.paymentStatus || 'Unknown'}`, {
                        x: MARGIN_X + 10,
                        y: footerY + 77,
                        size: 12,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                    });
                }

                // Signatures section
                page.drawText('Customer Signature:', {
                    x: MARGIN_X + 50,
                    y: footerY,
                    size: 12,
                    font: timesBoldFont,
                    color: rgb(0, 0, 0),
                });
                
                page.drawLine({
                    start: { x: MARGIN_X + 50, y: footerY - 20 },
                    end: { x: MARGIN_X + 200, y: footerY - 20 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
                
                page.drawText('For Agro Pharmacy:', {
                    x: MARGIN_X + CONTENT_WIDTH - 200,
                    y: footerY,
                    size: 12,
                    font: timesBoldFont,
                    color: rgb(0, 0, 0),
                });
                
                page.drawLine({
                    start: { x: MARGIN_X + CONTENT_WIDTH - 200, y: footerY - 20 },
                    end: { x: MARGIN_X + CONTENT_WIDTH - 50, y: footerY - 20 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
                
                page.drawText('Authorized Signatory', {
                    x: MARGIN_X + CONTENT_WIDTH - 170,
                    y: footerY - 40,
                    size: 10,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
                page.drawRectangle({
                    x: MARGIN_X + 10,
                    y: 60,
                    width: CONTENT_WIDTH - 20,
                    height: 30,
                    color: whiteText,
                });
                page.drawText(
                    'Important: Goods once sold will not be taken back or exchanged. Subject to local jurisdiction.',
                    {
                        x: MARGIN_X + 20,
                        y: 70,
                        size: 9,
                        font: timesRomanFont,
                        color: blackText,
                    }
                );
            }
        };

        // Pagination logic
        const items = order.products || [];
        
        // Make sure we have no more than 15 products
        const limitedItems = items.length > MAX_ITEMS ? items.slice(0, MAX_ITEMS) : items;
        
        // Create a single page
        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        
        // Draw page border
        page.drawRectangle({
            x: MARGIN_X,
            y: 50,
            width: CONTENT_WIDTH,
            height: PAGE_HEIGHT - 100,
            color: rgb(1, 1, 1),
        });
        
        // Create header
        const currentY = createPageHeader(page, 1, 1);
        
        // Create table with grid for exactly 15 rows
        const table = createTableHeaders(page, currentY, true);
        
        // Draw items
        for (let row = 0; row < limitedItems.length; row++) {
            drawItem(page, limitedItems[row], row, row, table);
        }
        
        // Add total row at the bottom of the table
        drawTotalRow(page, limitedItems, table);
        
        // Add footer (adjust position to account for total row)
        addPageFooter(page, table.startY - table.tableHeight - 45, true);
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating invoice PDF bytes:', error);
        throw error;
    }
}

export const generateWholesaleInvoicePdfBytes = async (orderData?: any) => {
    try {
        // Sample order data if none provided
        const staticOrderData = {
            _id: 'sample123456',
            invoiceNumber: 'INV-2023-001',
            captureDate: new Date().toISOString(),
            total: 1500.00,
            subTotal: 1271.19,
            totalGst: 228.81,
            roundOff: 0,
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            customerData: {
                name: 'Sample Customer',
                address: '123 Sample Street, Sample City - 380001',
                mobile: '9876543210'
            },
            products: [
                {
                    productId: 'prod1',
                    productData: {
                        name: 'Fertilizer A',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12345'
                    },
                    variantData: {
                        packingSize: '10kg'
                    },
                    unit: 10,
                    cartoon: 5,
                    lotNo: 'L001',
                    quantity: 50,
                    price: 100.00,
                    total: 5000.00
                },
                {
                    productId: 'prod2',
                    productData: {
                        name: 'Fertilizer B',
                        manufacturer: 'Agro Corp',
                        batchNo: 'B12346'
                    },
                    variantData: {
                        packingSize: '10kg'
                    },
                    unit: 10,
                    cartoon: 5,
                    lotNo: 'L001',
                    quantity: 50,
                    price: 100.00,
                    total: 5000.00
                }
            ]
        };

        const order = orderData || staticOrderData;
        
        // Check if order has more than 15 items and return an error message
        if (order.products && order.products.length > 15) {
            throw new Error("Invoice generation failed: Maximum 15 product items allowed per invoice.");
        }
        
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;

        // Layout constants
        const PAGE_WIDTH = 800;
        const PAGE_HEIGHT = 1000;
        const MARGIN_X = 50;
        const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_X * 2);
        const HEADER_HEIGHT = 280;
        const FOOTER_HEIGHT = 220;
        const FOOTER_HEIGHT_REGULAR = 50;
        const ITEM_HEIGHT = 25;
        const TABLE_HEADER_HEIGHT = 20;
        
        // Fixed number of items per invoice
        const MAX_ITEMS = 15;
        // Fixed table height for 15 items
        const FIXED_TABLE_HEIGHT = MAX_ITEMS * ITEM_HEIGHT + TABLE_HEADER_HEIGHT;

        // Define colors
        const greenBackground = rgb(0.24, 0.35, 0.26); // Dark green color (converted from 61,89,67)
        const whiteText = rgb(1, 1, 1); // White text
        const blackText = rgb(0, 0, 0); // Black text

        // Helper functions
        const createPageHeader = (page: any, pageNumber: number, totalPages: number) => {
            page.drawRectangle({
                x: MARGIN_X,
                y: 50,
                width: CONTENT_WIDTH,
                height: PAGE_HEIGHT - 100,
                color: whiteText
            });
            
            // Green background for header section
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 150,
                width: CONTENT_WIDTH,
                height: 100,
                color: whiteText, // Dark green color
            });
            
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 140,
                width: 80,
                height: 80,
                color: rgb(0.95, 0.95, 0.95),
            });
            
            page.drawText('DELIVERY CHALLAN', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 105,
                size: 14,
                font: timesBoldFont,
                color: blackText, // White text
            });
            
            page.drawText('SARTHI AGROTECH', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 80,
                size: 24,
                font: timesBoldFont,
                color: blackText, // White text
            });

            //company address set right side top corner
            const companyAddress = '123 Pharmacy Street, Medical District, City - 380001';
            const companyAddressWidth = timesRomanFont.widthOfTextAtSize(companyAddress, 10);
            page.drawText(companyAddress, {
                x: PAGE_WIDTH - companyAddressWidth - 60,
                y: PAGE_HEIGHT - 70,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // mobile number set below company address
            const companyMobileNumber = 'Mobile: +91 9876543210';
            const companyMobileNumberWidth = timesRomanFont.widthOfTextAtSize(companyMobileNumber, 10);

            page.drawText(companyMobileNumber, {
                x: PAGE_WIDTH - companyMobileNumberWidth - 60,
                y: PAGE_HEIGHT - 85,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // gst number set below mobile number
            const companyGSTNumber = 'GST No: 24ABCDE1234F1Z5';
            const companyGSTNumberWidth = timesRomanFont.widthOfTextAtSize(companyGSTNumber, 10);
            page.drawText(companyGSTNumber, {
                x: PAGE_WIDTH - companyGSTNumberWidth - 60,
                y: PAGE_HEIGHT - 100,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // drug license set below gst number
            const companyDrugLicense = 'Drug License: GJ-12345';
            const companyDrugLicenseWidth = timesRomanFont.widthOfTextAtSize(companyDrugLicense, 10);
            page.drawText(companyDrugLicense, {
                x: PAGE_WIDTH - companyDrugLicenseWidth - 60,
                y: PAGE_HEIGHT - 115,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            // Invoice details and customer info
            // Background color for the invoice details section
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 250,
                width: CONTENT_WIDTH,
                height: 50,
                color: whiteText, // Dark green color
            });
            
            page.drawText(`Invoice #: ${order.invoiceNumber || 'INV-2023-001'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 170,
                size: 12,
                font: timesRomanFont,
                color: blackText, // Black text for this section
            });
            
            const orderDate = order.captureDate ? new Date(order.captureDate).toLocaleDateString() : new Date().toLocaleDateString();
            page.drawText('Date: ' + orderDate, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 190,
                size: 12,
                font: timesRomanFont,
                color: blackText, // Black text for this section
            });
            
            page.drawText('Bill To:', {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 220,
                size: 12,
                font: timesBoldFont,
                color: blackText, // White text
            });
            
            page.drawText(`Name: ${order.customerData?.name || 'Customer Name'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            const customerAddress = order.customerData?.address || 'Customer Address';
            const fullCustomerAddress = `Address: ${customerAddress}`;
            const customerAddressWidth = timesRomanFont.widthOfTextAtSize(fullCustomerAddress, 10);
            page.drawText(fullCustomerAddress, {
                x: PAGE_WIDTH / 2 - customerAddressWidth / 2,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: blackText, // White text
            });
            
            if (order.customerData?.mobile) {
                page.drawText(`Mobile: ${order.customerData.mobile}`, {
                    x: PAGE_WIDTH - 145,
                    y: PAGE_HEIGHT - 240,
                    size: 10,
                    font: timesRomanFont,
                    color: blackText, // White text
                });
            }
            
            return PAGE_HEIGHT - HEADER_HEIGHT;
        };

        const createTableHeaders = (page: any, startY: number, isLastPage: boolean) => {
            // Always use fixed table height for 15 rows
            const tableHeight = FIXED_TABLE_HEIGHT;
            
            // Draw table background (white) - EXCLUDING the header row
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: startY - tableHeight,
                width: CONTENT_WIDTH - 20,
                height: tableHeight - TABLE_HEADER_HEIGHT, // Reduce height to exclude header
                color: rgb(0.95, 0.95, 0.95), // White background for table body
            });
            
            // Draw table header with green background - as a separate rectangle
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: startY - TABLE_HEADER_HEIGHT,
                width: CONTENT_WIDTH - 20,
                height: TABLE_HEADER_HEIGHT,
                color: greenBackground, // Green background for header
            });
            
            // Column positions - redistributed to increase Rate and Amount widths
            // and decrease Pack, Unit, Cartoon, and Qty widths
            const columnPositions = [
                MARGIN_X + 10,        // S.No
                MARGIN_X + 50,        // Product
                MARGIN_X + 190,       // Pack (decreased)
                MARGIN_X + 250,       // Unit (decreased)
                MARGIN_X + 300,       // Cartoon (decreased)
                MARGIN_X + 370,       // Lot No
                MARGIN_X + 430,       // Qty (decreased)
                MARGIN_X + 510,       // Rate (increased)
                MARGIN_X + 600,       // Amount (increased)
                MARGIN_X + CONTENT_WIDTH - 10 // End edge
            ];
            
            // Draw vertical grid lines for all 15 rows
            for (let i = 0; i < columnPositions.length; i++) {
                page.drawLine({
                    start: { x: columnPositions[i], y: startY },
                    end: { x: columnPositions[i], y: startY - tableHeight },
                    thickness: 1,
                    color: whiteText,
                });
            }
            
            // Draw horizontal grid lines for all 15 rows
            for (let i = 1; i <= MAX_ITEMS; i++) {
                page.drawLine({
                    start: { x: MARGIN_X + 10, y: startY - TABLE_HEADER_HEIGHT - (i * ITEM_HEIGHT) },
                    end: { x: MARGIN_X + CONTENT_WIDTH - 10, y: startY - TABLE_HEADER_HEIGHT - (i * ITEM_HEIGHT) },
                    thickness: 0.5,
                    color: whiteText,
                });
            }
            
            // Draw column headers with white text - adjusted positions for new column widths
            const headerY = startY - 15;
            const fontSize = 10;
            page.drawText('S.No', { x: MARGIN_X + 20, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Product', { x: MARGIN_X + 60, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Pack', { x: MARGIN_X + 200, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Unit', { x: MARGIN_X + 260, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Cartoon', { x: MARGIN_X + 310, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Lot No.', { x: MARGIN_X + 380, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Qty', { x: MARGIN_X + 440, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Rate', { x: MARGIN_X + 520, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Amount', { x: MARGIN_X + 610, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            
            return {
                startY,
                tableHeight,
                columnPositions,
                maxItems: MAX_ITEMS,
                footerHeight: isLastPage ? FOOTER_HEIGHT : FOOTER_HEIGHT_REGULAR
            };
        };

        const drawItem = (page: any, item: any, index: number, rowIndex: number, tableInfo: any) => {
            const fontSize = 10;
            const itemY = tableInfo.startY - TABLE_HEADER_HEIGHT - (rowIndex + 1) * ITEM_HEIGHT + 5;
            const itemNo = index + 1;
            const itemName = item.productData?.name || 'Unknown Product';
            const packingSize = item.variantData?.packingSize || '-';
            const price = item.price || 0;
            const quantity = item.quantity || 0;
            const itemTotal = item.total || (price * quantity);
            const unit = item.unit?.toString() || '-';
            const cartoon = item.cartoon?.toString() || '-';
            const lotNo = item.lotNo || '-';
            
            // Draw each column with proper positioning
            page.drawText(itemNo.toString(), {
                x: tableInfo.columnPositions[0] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            const maxNameLength = 22; // Slightly reduced to fit column width
            const displayName = itemName.length > maxNameLength
                ? itemName.substring(0, maxNameLength) + '...'
                : itemName;
            page.drawText(displayName, {
                x: tableInfo.columnPositions[1] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(packingSize, {
                x: tableInfo.columnPositions[2] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(unit, {
                x: tableInfo.columnPositions[3] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(cartoon, {
                x: tableInfo.columnPositions[4] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(lotNo, {
                x: tableInfo.columnPositions[5] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(quantity.toString(), {
                x: tableInfo.columnPositions[6] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(formatCurrency(price), {
                x: tableInfo.columnPositions[7] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            page.drawText(formatCurrency(itemTotal), {
                x: tableInfo.columnPositions[8] + 10,
                y: itemY,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
        };

        // Add new function to draw total row
        const drawTotalRow = (page: any, items: any[], tableInfo: any) => {
            const fontSize = 10;
            const totalY = tableInfo.startY - TABLE_HEADER_HEIGHT - (MAX_ITEMS * ITEM_HEIGHT) - 15;
            
            // Draw total row background
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: totalY - 5,
                width: CONTENT_WIDTH - 20,
                height: 25,
                color: greenBackground,
            });
            
            // Calculate column-specific totals
            let totalQuantity = 0;
            let totalAmount = 0;
            let totalPrice = 0; // For average price calculation
            
            items.forEach(item => {
                totalQuantity += item.quantity || 0;
                totalAmount += item.total || 0;
                totalPrice += (item.price || 0) * (item.quantity || 0);
            });
            
            // Calculate average price (if needed)
            const avgPrice = totalQuantity > 0 ? (totalPrice / totalQuantity) : 0;
            
            // Draw total row text
            page.drawText("TOTAL", {
                x: tableInfo.columnPositions[1] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
            
            // Draw quantity total
            page.drawText(totalQuantity.toString(), {
                x: tableInfo.columnPositions[6] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
            
            // Draw price column (average price)
            page.drawText(formatCurrency(avgPrice), {
                x: tableInfo.columnPositions[7] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
            
            // Draw amount total
            page.drawText(formatCurrency(totalAmount), {
                x: tableInfo.columnPositions[8] + 10,
                y: totalY,
                size: fontSize,
                font: timesBoldFont,
                color: whiteText,
            });
        };

        const addPageFooter = (page: any, yPosition: number, isLastPage: boolean) => {
            if (isLastPage) {
                const footerY = 170;
                if (order?.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 90,
                        width: 160,
                        height: 25,
                        color: whiteText,
                    });
                    page.drawText('GST:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                    page.drawText(formatCurrency(order.totalGst), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                }
                if (order.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 55,
                        width: 160,
                        height: 25,
                        color: whiteText,
                    });
                    const finalTotal = order.total;
                    page.drawText('Total:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                    page.drawText(formatCurrency(finalTotal), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: blackText,
                    });
                }
                if (order.paymentMethod) {
                    page.drawText(`Payment Method: ${order.paymentMethod}`, {
                        x: MARGIN_X + 10,
                        y: footerY + 97,
                        size: 12,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                    });
                    page.drawText(`Payment Status: ${order.paymentStatus || 'Unknown'}`, {
                        x: MARGIN_X + 10,
                        y: footerY + 77,
                        size: 12,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                    });
                }

                // Add bank details section in place of the import notice
                page.drawRectangle({
                    x: MARGIN_X + 10,
                    y: 25,
                    width: CONTENT_WIDTH - 20,
                    height: 85, // Increased height for two bank details
                    color: whiteText,
                });

                // Bank details title
                page.drawText('BANK DETAILS', {
                    x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 - 45,
                    y: 90,
                    size: 12,
                    font: timesBoldFont,
                    color: blackText,
                });

                // First Bank Details
                const bank1Name = order?.bankDetails?.bank1Name || 'STATE BANK OF INDIA';
                const bank1AccountNumber = order?.bankDetails?.bank1AccountNumber || '1234567890123456';
                const bank1IFSC = order?.bankDetails?.bank1IFSC || 'SBIN0001234';

                page.drawText(`Bank Name: ${bank1Name}`, {
                    x: MARGIN_X + 30,
                    y: 70,
                    size: 9,
                    font: timesRomanFont,
                    color: blackText,
                });

                page.drawText(`A/C No: ${bank1AccountNumber}`, {
                    x: MARGIN_X + 30,
                    y: 55,
                    size: 9,
                    font: timesRomanFont,
                    color: blackText,
                });

                page.drawText(`IFSC Code: ${bank1IFSC}`, {
                    x: MARGIN_X + 30,
                    y: 40,
                    size: 9,
                    font: timesRomanFont,
                    color: blackText,
                });

                // Second Bank Details (if available)
                const hasSecondBank = order?.bankDetails?.bank2Name || true; // Default to true for demo

                if (hasSecondBank) {
                    const bank2Name = order?.bankDetails?.bank2Name || 'HDFC BANK';
                    const bank2AccountNumber = order?.bankDetails?.bank2AccountNumber || '50100987654321098';
                    const bank2IFSC = order?.bankDetails?.bank2IFSC || 'HDFC0009876';

                    // Add vertical separator between bank details
                    page.drawLine({
                        start: { x: MARGIN_X + (CONTENT_WIDTH - 20) / 2, y: 80 },
                        end: { x: MARGIN_X + (CONTENT_WIDTH - 20) / 2, y: 35 },
                        thickness: 1,
                        color: blackText,
                    });

                    page.drawText(`Bank Name: ${bank2Name}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 70,
                        size: 9,
                        font: timesRomanFont,
                        color: blackText,
                    });

                    page.drawText(`A/C No: ${bank2AccountNumber}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 55,
                        size: 9,
                        font: timesRomanFont,
                        color: blackText,
                    });

                    page.drawText(`IFSC Code: ${bank2IFSC}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 40,
                        size: 9,
                        font: timesRomanFont,
                        color: blackText,
                    });
                }

                // Signatures section
                page.drawText('Customer Signature:', {
                    x: MARGIN_X + 50,
                    y: footerY,
                    size: 12,
                    font: timesBoldFont,
                    color: rgb(0, 0, 0),
                });
                
                page.drawLine({
                    start: { x: MARGIN_X + 50, y: footerY - 20 },
                    end: { x: MARGIN_X + 200, y: footerY - 20 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
                
                page.drawText('For Agro Pharmacy:', {
                    x: MARGIN_X + CONTENT_WIDTH - 200,
                    y: footerY,
                    size: 12,
                    font: timesBoldFont,
                    color: rgb(0, 0, 0),
                });
                
                page.drawLine({
                    start: { x: MARGIN_X + CONTENT_WIDTH - 200, y: footerY - 20 },
                    end: { x: MARGIN_X + CONTENT_WIDTH - 50, y: footerY - 20 },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
                
                page.drawText('Authorized Signatory', {
                    x: MARGIN_X + CONTENT_WIDTH - 170,
                    y: footerY - 40,
                    size: 10,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
            }
        };

        // Pagination logic
        const items = order.products || [];
        
        // Make sure we have no more than 15 products
        const limitedItems = items.length > MAX_ITEMS ? items.slice(0, MAX_ITEMS) : items;
        
        // Create a single page
        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        
        // Draw page border
        page.drawRectangle({
            x: MARGIN_X,
            y: 50,
            width: CONTENT_WIDTH,
            height: PAGE_HEIGHT - 100,
            color: rgb(1, 1, 1),
        });
        
        // Create header
        const currentY = createPageHeader(page, 1, 1);
        
        // Create table with grid for exactly 15 rows
        const table = createTableHeaders(page, currentY, true);
        
        // Draw items
        for (let row = 0; row < limitedItems.length; row++) {
            drawItem(page, limitedItems[row], row, row, table);
        }
        
        // Add total row at the bottom of the table
        drawTotalRow(page, limitedItems, table);
        
        // Add footer (adjust position to account for total row)
        addPageFooter(page, table.startY - table.tableHeight - 45, true);
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating invoice PDF bytes:', error);
        throw error;
    }
}

export const generateSlipPdfBytes = async (orderData?: any) => {
    try {
        // Sample order data if none provided
        const staticOrderData = {
            _id: 'sample123456',
            invoiceNumber: 'RCPT-2023-001',
            captureDate: new Date().toISOString(),
            total: 1500.00,
            subTotal: 1271.19,
            totalGst: 228.81,
            roundOff: 0,
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            customerData: {
                name: 'Sample Customer',
                address: '123 Sample Street, Sample City - 380001',
                mobile: '9876543210'
            }
        };

        const order = orderData || staticOrderData;
        
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;

        // Function to convert number to words (Indian numbering system)
        const numberToWords = (num: number) => {
            const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            
            const numToWord = (n: number): string => {
                if (n < 20) return units[n];
                if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
                if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numToWord(n % 100) : '');
                if (n < 100000) return numToWord(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWord(n % 1000) : '');
                if (n < 10000000) return numToWord(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numToWord(n % 100000) : '');
                return numToWord(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numToWord(n % 10000000) : '');
            };
            
            const intPart = Math.floor(num);
            const decimalPart = Math.round((num - intPart) * 100);
            
            let result = numToWord(intPart) + ' Rupees';
            if (decimalPart > 0) {
                result += ' and ' + numToWord(decimalPart) + ' Paise';
            }
            
            return result;
        };

        // Layout constants - smaller size for receipt/slip
        const PAGE_WIDTH = 300;
        const PAGE_HEIGHT = 550;
        const MARGIN_X = 15;
        const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_X * 2);

        // Define colors - maintain consistent branding with invoices
        const greenBackground = rgb(0.24, 0.35, 0.26); // Dark green color
        const whiteText = rgb(1, 1, 1); // White text
        
        // Create a page
        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        
        // Draw page border
        page.drawRectangle({
            x: 5,
            y: 5,
            width: PAGE_WIDTH - 10,
            height: PAGE_HEIGHT - 10,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
            color: rgb(1, 1, 1) // White fill
        });
        
        // Header with store name and logo area
        page.drawRectangle({
            x: MARGIN_X,
            y: PAGE_HEIGHT - 45,
            width: CONTENT_WIDTH,
            height: 30,
            color: greenBackground
        });
        
        page.drawText('SARTHI AGROTECH', {
            x: 75,
            y: PAGE_HEIGHT - 30,
            size: 14,
            font: timesBoldFont,
            color: whiteText
        });
        
        // Store address and contact details
        page.drawText('123 Pharmacy Street, Medical District', {
            x: 50,
            y: PAGE_HEIGHT - 60,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });
        
        page.drawText('City - 380001, Mobile: +91 9876543210', {
            x: 50,
            y: PAGE_HEIGHT - 72,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });
        
        page.drawText('GST No: 24ABCDE1234F1Z5', {
            x: 80,
            y: PAGE_HEIGHT - 84,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });
        
        // Receipt title
        page.drawRectangle({
            x: MARGIN_X,
            y: PAGE_HEIGHT - 105,
            width: CONTENT_WIDTH,
            height: 20,
            color: greenBackground
        });
        
        page.drawText('PAYMENT RECEIPT', {
            x: 95,
            y: PAGE_HEIGHT - 100,
            size: 12,
            font: timesBoldFont,
            color: whiteText
        });
        
        // Receipt details section
        const receiptNumber = order.invoiceNumber || 'RCPT-2023-001';
        const receiptDate = order.captureDate ? new Date(order.captureDate).toLocaleDateString() : new Date().toLocaleDateString();
        
        page.drawText(`Receipt No: ${receiptNumber}`, {
            x: MARGIN_X,
            y: PAGE_HEIGHT - 130,
            size: 10,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        page.drawText(`Date: ${receiptDate}`, {
            x: MARGIN_X + 150,
            y: PAGE_HEIGHT - 130,
            size: 10,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        // Horizontal line
        page.drawLine({
            start: { x: MARGIN_X, y: PAGE_HEIGHT - 140 },
            end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 140 },
            thickness: 1,
            color: rgb(0, 0, 0)
        });
        
        // Customer details
        page.drawText('Received from:', {
            x: MARGIN_X,
            y: PAGE_HEIGHT - 160,
            size: 10,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        const customerName = order.customerData?.name || 'Walk-in Customer';
        page.drawText(customerName, {
            x: MARGIN_X + 85,
            y: PAGE_HEIGHT - 160,
            size: 10,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
        });
        
        if (order.customerData?.mobile) {
            page.drawText(`Mobile: ${order.customerData.mobile}`, {
                x: MARGIN_X,
                y: PAGE_HEIGHT - 175,
                size: 9,
                font: timesRomanFont,
                color: rgb(0, 0, 0)
            });
        }
        
        if (order.customerData?.address) {
            const addressLines = order.customerData.address.match(/.{1,40}/g) || [];
            addressLines.forEach((line: string, index: number) => {
                if (index < 2) { // Limit to 2 lines
                    page.drawText(line, {
                        x: MARGIN_X,
                        y: PAGE_HEIGHT - 190 - (index * 12),
                        size: 8,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0)
                    });
                }
            });
        }
        
        // Horizontal line
        page.drawLine({
            start: { x: MARGIN_X, y: PAGE_HEIGHT - 215 },
            end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 215 },
            thickness: 1,
            color: rgb(0, 0, 0)
        });
        
        // Payment details box
        page.drawRectangle({
            x: MARGIN_X,
            y: PAGE_HEIGHT - 285,
            width: CONTENT_WIDTH,
            height: 60,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
            color: rgb(0.97, 0.97, 0.97) // Light gray background
        });
        
        // Payment amount in figures
        page.drawText('Amount:', {
            x: MARGIN_X + 5,
            y: PAGE_HEIGHT - 235,
            size: 12,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        const totalAmount = order.total || 1500.00;
        page.drawText(formatCurrency(totalAmount), {
            x: MARGIN_X + 145,
            y: PAGE_HEIGHT - 235,
            size: 12,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        // Horizontal separator inside payment box
        page.drawLine({
            start: { x: MARGIN_X, y: PAGE_HEIGHT - 245 },
            end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 245 },
            thickness: 0.5,
            color: rgb(0, 0, 0)
        });
        
        // Amount in words
        page.drawText('Amount in words:', {
            x: MARGIN_X + 5,
            y: PAGE_HEIGHT - 260,
            size: 9,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        // Convert amount to words and handle wrapping
        const amountInWords = numberToWords(totalAmount);
        const maxLineLength = 40;
        let wordsRemaining = amountInWords;
        let currentLine = 0;
        
        while (wordsRemaining.length > 0 && currentLine < 2) {
            const lineText = wordsRemaining.length > maxLineLength 
                ? wordsRemaining.substring(0, maxLineLength) + '-' 
                : wordsRemaining;
                
            page.drawText(lineText, {
                x: MARGIN_X + 5,
                y: PAGE_HEIGHT - 275 - (currentLine * 15),
                size: 8,
                font: timesRomanFont,
                color: rgb(0, 0, 0)
            });
            
            if (wordsRemaining.length > maxLineLength) {
                wordsRemaining = wordsRemaining.substring(maxLineLength);
            } else {
                wordsRemaining = '';
            }
            
            currentLine++;
        }
        
        // Payment method and status
        page.drawText(`Payment Method: ${order.paymentMethod || 'Cash'}`, {
            x: MARGIN_X,
            y: PAGE_HEIGHT - 310,
            size: 10,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        page.drawText(`Payment Status: ${order.paymentStatus || 'Paid'}`, {
            x: MARGIN_X + 150,
            y: PAGE_HEIGHT - 310,
            size: 10,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        // For section
        if (order.orderType) {
            page.drawText(`For: ${order.orderType}`, {
                x: MARGIN_X,
                y: PAGE_HEIGHT - 330,
                size: 9,
                font: timesRomanFont,
                color: rgb(0, 0, 0)
            });
        }
        
        if (order.invoiceNumber && order.invoiceNumber !== receiptNumber) {
            page.drawText(`Invoice Ref: ${order.invoiceNumber}`, {
                x: MARGIN_X + 150,
                y: PAGE_HEIGHT - 330,
                size: 9,
                font: timesRomanFont,
                color: rgb(0, 0, 0)
            });
        }
        
        // Signature sections
        page.drawText('Customer Signature:', {
            x: MARGIN_X,
            y: PAGE_HEIGHT - 380,
            size: 9,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        // Line for signature
        page.drawLine({
            start: { x: MARGIN_X, y: PAGE_HEIGHT - 410 },
            end: { x: MARGIN_X + 100, y: PAGE_HEIGHT - 410 },
            thickness: 0.5,
            color: rgb(0, 0, 0)
        });
        
        page.drawText('Authorized Signature:', {
            x: MARGIN_X + 130,
            y: PAGE_HEIGHT - 380,
            size: 9,
            font: timesBoldFont,
            color: rgb(0, 0, 0)
        });
        
        // Line for signature
        page.drawLine({
            start: { x: MARGIN_X + 130, y: PAGE_HEIGHT - 410 },
            end: { x: MARGIN_X + 230, y: PAGE_HEIGHT - 410 },
            thickness: 0.5,
            color: rgb(0, 0, 0)
        });
        
        // Thank you note
        page.drawRectangle({
            x: MARGIN_X,
            y: PAGE_HEIGHT - 440,
            width: CONTENT_WIDTH,
            height: 20,
            color: greenBackground
        });
        
        page.drawText('Thank you for your business!', {
            x: 75,
            y: PAGE_HEIGHT - 435,
            size: 10,
            font: timesBoldFont,
            color: whiteText
        });
        
        // Bank details in footer - simplified version
        page.drawRectangle({
            x: MARGIN_X,
            y: MARGIN_X,
            width: CONTENT_WIDTH,
            height: 60,
            color: greenBackground
        });
        
        // Bank details title
        page.drawText('BANK DETAILS', {
            x: 110,
            y: 65,
            size: 9,
            font: timesBoldFont,
            color: whiteText
        });
        
        // First Bank Details
        const bank1Name = order?.bankDetails?.bank1Name || 'STATE BANK OF INDIA';
        const bank1AccountNumber = order?.bankDetails?.bank1AccountNumber || '1234567890123456';
        const bank1IFSC = order?.bankDetails?.bank1IFSC || 'SBIN0001234';
        
        page.drawText(`${bank1Name} | A/C: ${bank1AccountNumber} | IFSC: ${bank1IFSC}`, {
            x: MARGIN_X + 5,
            y: 50,
            size: 7,
            font: timesRomanFont,
            color: whiteText
        });
        
        // Second Bank if available
        const hasSecondBank = order?.bankDetails?.bank2Name || true; // Default to true for demo
        
        if (hasSecondBank) {
            const bank2Name = order?.bankDetails?.bank2Name || 'HDFC BANK';
            const bank2AccountNumber = order?.bankDetails?.bank2AccountNumber || '50100987654321098';
            const bank2IFSC = order?.bankDetails?.bank2IFSC || 'HDFC0009876';
            
            page.drawText(`${bank2Name} | A/C: ${bank2AccountNumber} | IFSC: ${bank2IFSC}`, {
                x: MARGIN_X + 5,
                y: 35,
                size: 7,
                font: timesRomanFont,
                color: whiteText
            });
        }
        
        page.drawText('This is a computer-generated receipt and does not require a signature.', {
            x: 20,
            y: 20,
            size: 6,
            font: timesRomanFont,
            color: whiteText
        });
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating slip PDF bytes:', error);
        throw error;
    }
}