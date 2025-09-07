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
        const greenBackground = rgb(0.24, 0.35, 0.26); // Fixed: Dark green color (converted from 61,89,67)
        const whiteText = rgb(1, 1, 1); // White text

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
                color: greenBackground, // Dark green color
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
                color: whiteText, // White text
            });
            
            page.drawText('SARTHI AGROTECH', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 80,
                size: 24,
                font: timesBoldFont,
                color: whiteText, // White text
            });

            //company address set right side top corner
            const companyAddress = '123 Pharmacy Street, Medical District, City - 380001';
            const companyAddressWidth = timesRomanFont.widthOfTextAtSize(companyAddress, 10);
            page.drawText(companyAddress, {
                x: PAGE_WIDTH - companyAddressWidth - 60,
                y: PAGE_HEIGHT - 70,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // mobile number set below company address
            const companyMobileNumber = 'Mobile: +91 9876543210';
            const companyMobileNumberWidth = timesRomanFont.widthOfTextAtSize(companyMobileNumber, 10);

            page.drawText(companyMobileNumber, {
                x: PAGE_WIDTH - companyMobileNumberWidth - 60,
                y: PAGE_HEIGHT - 85,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // gst number set below mobile number
            const companyGSTNumber = 'GST No: 24ABCDE1234F1Z5';
            const companyGSTNumberWidth = timesRomanFont.widthOfTextAtSize(companyGSTNumber, 10);
            page.drawText(companyGSTNumber, {
                x: PAGE_WIDTH - companyGSTNumberWidth - 60,
                y: PAGE_HEIGHT - 100,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // drug license set below gst number
            const companyDrugLicense = 'Drug License: GJ-12345';
            const companyDrugLicenseWidth = timesRomanFont.widthOfTextAtSize(companyDrugLicense, 10);
            page.drawText(companyDrugLicense, {
                x: PAGE_WIDTH - companyDrugLicenseWidth - 60,
                y: PAGE_HEIGHT - 115,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // Invoice details and customer info
            // Background color for the invoice details section
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 250,
                width: CONTENT_WIDTH,
                height: 50,
                color: greenBackground, // Dark green color
            });
            
            page.drawText(`Invoice #: ${order.invoiceNumber || 'INV-2023-001'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 170,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0), // Black text for this section
            });
            
            const orderDate = order.captureDate ? new Date(order.captureDate).toLocaleDateString() : new Date().toLocaleDateString();
            page.drawText('Date: ' + orderDate, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 190,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0), // Black text for this section
            });
            
            page.drawText('Bill To:', {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 220,
                size: 12,
                font: timesBoldFont,
                color: whiteText, // White text
            });
            
            page.drawText(`Name: ${order.customerData?.name || 'Customer Name'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            const customerAddress = order.customerData?.address || 'Customer Address';
            const fullCustomerAddress = `Address: ${customerAddress}`;
            const customerAddressWidth = timesRomanFont.widthOfTextAtSize(fullCustomerAddress, 10);
            page.drawText(fullCustomerAddress, {
                x: PAGE_WIDTH / 2 - customerAddressWidth / 2,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            if (order.customerData?.mobile) {
                page.drawText(`Mobile: ${order.customerData.mobile}`, {
                    x: PAGE_WIDTH - 145,
                    y: PAGE_HEIGHT - 240,
                    size: 10,
                    font: timesRomanFont,
                    color: whiteText, // White text
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
            page.drawText('S.No', { x: MARGIN_X + 25, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Product', { x: MARGIN_X + 100, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Pack', { x: MARGIN_X + 205, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Unit', { x: MARGIN_X + 265, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Cartoon', { x: MARGIN_X + 320, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Lot No.', { x: MARGIN_X + 385, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Qty', { x: MARGIN_X + 450, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Rate', { x: MARGIN_X + 545, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            page.drawText('Amount', { x: MARGIN_X + 635, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
            
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
            const maxNameLength = 25;
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
            const maxMfgLength = 18;
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
                color: greenBackground, // Light gray background for total row
            });
            
            // Add vertical borders for each column
            // for (let i = 0; i < tableInfo.columnPositions.length; i++) {
            //     page.drawLine({
            //         start: { x: tableInfo.columnPositions[i], y: totalY + 20 },
            //         end: { x: tableInfo.columnPositions[i], y: totalY - 5 },
            //         thickness: 1,
            //         color: rgb(0, 0, 0),
            //     });
            // }
            
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
                        color: greenBackground,
                    });
                    page.drawText('GST:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
                    });
                    page.drawText(formatCurrency(order.totalGst), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
                    });
                }
                if (order.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 55,
                        width: 160,
                        height: 25,
                        color: greenBackground,
                    });
                    const finalTotal = order.total;
                    page.drawText('Total:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
                    });
                    page.drawText(formatCurrency(finalTotal), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
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
                    y: 60,
                    width: CONTENT_WIDTH - 20,
                    height: 80, // Increased height for two bank details
                    color: greenBackground,
                });

                // Bank details title
                page.drawText('BANK DETAILS', {
                    x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 - 45,
                    y: 130,
                    size: 12,
                    font: timesBoldFont,
                    color: whiteText,
                });

                // First Bank Details
                const bank1Name = order?.bankDetails?.bank1Name || 'STATE BANK OF INDIA';
                const bank1AccountNumber = order?.bankDetails?.bank1AccountNumber || '1234567890123456';
                const bank1IFSC = order?.bankDetails?.bank1IFSC || 'SBIN0001234';
                const bank1AccountHolder = order?.bankDetails?.bank1AccountHolder || 'SARTHI AGROTECH';

                page.drawText(`Bank Name: ${bank1Name}`, {
                    x: MARGIN_X + 30,
                    y: 110,
                    size: 9,
                    font: timesRomanFont,
                    color: whiteText,
                });

                page.drawText(`A/C No: ${bank1AccountNumber}`, {
                    x: MARGIN_X + 30,
                    y: 95,
                    size: 9,
                    font: timesRomanFont,
                    color: whiteText,
                });

                page.drawText(`IFSC Code: ${bank1IFSC}`, {
                    x: MARGIN_X + 30,
                    y: 80,
                    size: 9,
                    font: timesRomanFont,
                    color: whiteText,
                });

                page.drawText(`A/C Holder: ${bank1AccountHolder}`, {
                    x: MARGIN_X + 30,
                    y: 65,
                    size: 9,
                    font: timesRomanFont,
                    color: whiteText,
                });

                // Second Bank Details (if available)
                const hasSecondBank = order?.bankDetails?.bank2Name || true; // Default to true for demo

                if (hasSecondBank) {
                    const bank2Name = order?.bankDetails?.bank2Name || 'HDFC BANK';
                    const bank2AccountNumber = order?.bankDetails?.bank2AccountNumber || '50100987654321098';
                    const bank2IFSC = order?.bankDetails?.bank2IFSC || 'HDFC0009876';
                    const bank2AccountHolder = order?.bankDetails?.bank2AccountHolder || 'SARTHI AGROTECH';

                    // Add vertical separator between bank details
                    page.drawLine({
                        start: { x: MARGIN_X + (CONTENT_WIDTH - 20) / 2, y: 125 },
                        end: { x: MARGIN_X + (CONTENT_WIDTH - 20) / 2, y: 65 },
                        thickness: 1,
                        color: whiteText,
                    });

                    page.drawText(`Bank Name: ${bank2Name}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 110,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
                    });

                    page.drawText(`A/C No: ${bank2AccountNumber}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 95,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
                    });

                    page.drawText(`IFSC Code: ${bank2IFSC}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 80,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
                    });

                    page.drawText(`A/C Holder: ${bank2AccountHolder}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 65,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
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
        const greenBackground = rgb(0.24, 0.35, 0.26); // Fixed: Dark green color (converted from 61,89,67)
        const whiteText = rgb(1, 1, 1); // White text

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
                color: greenBackground, // Dark green color
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
                color: whiteText, // White text
            });
            
            page.drawText('SARTHI AGROTECH', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 80,
                size: 24,
                font: timesBoldFont,
                color: whiteText, // White text
            });

            //company address set right side top corner
            const companyAddress = '123 Pharmacy Street, Medical District, City - 380001';
            const companyAddressWidth = timesRomanFont.widthOfTextAtSize(companyAddress, 10);
            page.drawText(companyAddress, {
                x: PAGE_WIDTH - companyAddressWidth - 60,
                y: PAGE_HEIGHT - 70,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // mobile number set below company address
            const companyMobileNumber = 'Mobile: +91 9876543210';
            const companyMobileNumberWidth = timesRomanFont.widthOfTextAtSize(companyMobileNumber, 10);

            page.drawText(companyMobileNumber, {
                x: PAGE_WIDTH - companyMobileNumberWidth - 60,
                y: PAGE_HEIGHT - 85,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // gst number set below mobile number
            const companyGSTNumber = 'GST No: 24ABCDE1234F1Z5';
            const companyGSTNumberWidth = timesRomanFont.widthOfTextAtSize(companyGSTNumber, 10);
            page.drawText(companyGSTNumber, {
                x: PAGE_WIDTH - companyGSTNumberWidth - 60,
                y: PAGE_HEIGHT - 100,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // drug license set below gst number
            const companyDrugLicense = 'Drug License: GJ-12345';
            const companyDrugLicenseWidth = timesRomanFont.widthOfTextAtSize(companyDrugLicense, 10);
            page.drawText(companyDrugLicense, {
                x: PAGE_WIDTH - companyDrugLicenseWidth - 60,
                y: PAGE_HEIGHT - 115,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            // Invoice details and customer info
            // Background color for the invoice details section
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 250,
                width: CONTENT_WIDTH,
                height: 50,
                color: greenBackground, // Dark green color
            });
            
            page.drawText(`Invoice #: ${order.invoiceNumber || 'INV-2023-001'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 170,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0), // Black text for this section
            });
            
            const orderDate = order.captureDate ? new Date(order.captureDate).toLocaleDateString() : new Date().toLocaleDateString();
            page.drawText('Date: ' + orderDate, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 190,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0), // Black text for this section
            });
            
            page.drawText('Bill To:', {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 220,
                size: 12,
                font: timesBoldFont,
                color: whiteText, // White text
            });
            
            page.drawText(`Name: ${order.customerData?.name || 'Customer Name'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            const customerAddress = order.customerData?.address || 'Customer Address';
            const fullCustomerAddress = `Address: ${customerAddress}`;
            const customerAddressWidth = timesRomanFont.widthOfTextAtSize(fullCustomerAddress, 10);
            page.drawText(fullCustomerAddress, {
                x: PAGE_WIDTH / 2 - customerAddressWidth / 2,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: whiteText, // White text
            });
            
            if (order.customerData?.mobile) {
                page.drawText(`Mobile: ${order.customerData.mobile}`, {
                    x: PAGE_WIDTH - 145,
                    y: PAGE_HEIGHT - 240,
                    size: 10,
                    font: timesRomanFont,
                    color: whiteText, // White text
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
            page.drawText('S.No', { x: MARGIN_X + 25, y: headerY, size: fontSize, font: timesBoldFont, color: whiteText });
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
                        color: greenBackground,
                    });
                    page.drawText('GST:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
                    });
                    page.drawText(formatCurrency(order.totalGst), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 97,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
                    });
                }
                if (order.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 55,
                        width: 160,
                        height: 25,
                        color: greenBackground,
                    });
                    const finalTotal = order.total;
                    page.drawText('Total:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
                    });
                    page.drawText(formatCurrency(finalTotal), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: whiteText,
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
                    color: greenBackground,
                });

                // Bank details title
                page.drawText('BANK DETAILS', {
                    x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 - 45,
                    y: 90,
                    size: 12,
                    font: timesBoldFont,
                    color: whiteText,
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
                    color: whiteText,
                });

                page.drawText(`A/C No: ${bank1AccountNumber}`, {
                    x: MARGIN_X + 30,
                    y: 55,
                    size: 9,
                    font: timesRomanFont,
                    color: whiteText,
                });

                page.drawText(`IFSC Code: ${bank1IFSC}`, {
                    x: MARGIN_X + 30,
                    y: 40,
                    size: 9,
                    font: timesRomanFont,
                    color: whiteText,
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
                        color: whiteText,
                    });

                    page.drawText(`Bank Name: ${bank2Name}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 70,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
                    });

                    page.drawText(`A/C No: ${bank2AccountNumber}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 55,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
                    });

                    page.drawText(`IFSC Code: ${bank2IFSC}`, {
                        x: MARGIN_X + (CONTENT_WIDTH - 20) / 2 + 30,
                        y: 40,
                        size: 9,
                        font: timesRomanFont,
                        color: whiteText,
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

export const generateSlipPdfBytes = async (order?: any) => {
    try {
        const pdfDoc = await PDFDocument.create();
        
        // Use standard fonts for maximum compatibility
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        
        // Create a smaller page for the slip (receipt format)
        const page = pdfDoc.addPage([300, 550]); // Slightly taller to accommodate payment in words
        
        // Define currency format
        const formatCurrency = (amount: number) => {
            return `Rs. ${amount.toFixed(2)}`;
        };
        
        // Function to convert number to words
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
        
        // Add border around slip
        page.drawRectangle({
            x: 5,
            y: 5,
            width: 290,
            height: 540,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
            color: rgb(1, 1, 1), // White fill
        });
        
        // Header with store details
        page.drawText('SARTHI AGROTECH', {
            x: 70,
            y: 520,
            size: 14,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('123 Pharmacy Street, Medical District', {
            x: 30,
            y: 505,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('City - 380001, Mobile: +91 9876543210', {
            x: 30,
            y: 495,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('GST No: 24ABCDE1234F1Z5', {
            x: 30,
            y: 485,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Receipt Title
        page.drawText('CASH RECEIPT', {
            x: 95,
            y: 465,
            size: 12,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        // Draw horizontal separator
        page.drawLine({
            start: { x: 15, y: 455 },
            end: { x: 285, y: 455 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
        
        // Receipt details
        const receiptNumber = order?.invoiceNumber || 'RCPT-2023-001';
        const receiptDate = new Date().toLocaleDateString();
        
        page.drawText(`Receipt #: ${receiptNumber}`, {
            x: 15,
            y: 440,
            size: 9,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText(`Date: ${receiptDate}`, {
            x: 180,
            y: 440,
            size: 9,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Customer details
        const customerName = order?.customerData?.name || 'Walk-in Customer';
        page.drawText(`Customer: ${customerName}`, {
            x: 15,
            y: 425,
            size: 9,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        if (order?.customerData?.mobile) {
            page.drawText(`Mobile: ${order.customerData.mobile}`, {
                x: 15,
                y: 410,
                size: 9,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
        }
        
        // Draw horizontal separator
        page.drawLine({
            start: { x: 15, y: 400 },
            end: { x: 285, y: 400 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
        
        // Calculate the total instead of showing individual items
        let totalAmount = 0;
        
        if (order?.products && Array.isArray(order.products)) {
            order.products.forEach((item: any) => {
                totalAmount += item.total || (item.price * item.quantity);
            });
        } else {
            // Sample data if no order provided
            totalAmount = 1625.00; // Sample total based on the static items
        }
        
        // Add GST if available
        const gstAmount = order?.totalGst || (totalAmount * 0.18); // Sample 18% GST
        const roundOff = order?.roundOff || 0;
        
        // Final total with GST and roundoff
        const finalTotal = order?.total || (totalAmount + gstAmount + roundOff);
        
        // Draw the payment box
        page.drawRectangle({
            x: 15,
            y: 305,
            width: 270,
            height: 85,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
            color: rgb(0.97, 0.97, 0.97), // Light gray background
        });
        
        // Display total payment
        page.drawText('TOTAL PAYMENT:', {
            x: 20,
            y: 375,
            size: 12,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText(formatCurrency(finalTotal), {
            x: 190,
            y: 375,
            size: 12,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        // Horizontal separator inside payment box
        page.drawLine({
            start: { x: 15, y: 365 },
            end: { x: 285, y: 365 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });
        
        // Total in words
        page.drawText('Amount in words:', {
            x: 20,
            y: 350,
            size: 9,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        // Convert amount to words
        const amountInWords = numberToWords(finalTotal);
        
        // Split amount in words into multiple lines if needed
        const maxLineLength = 45;
        let wordsRemaining = amountInWords;
        let currentLine = 0;
        
        while (wordsRemaining.length > 0 && currentLine < 3) {
            const lineText = wordsRemaining.length > maxLineLength 
                ? wordsRemaining.substring(0, maxLineLength) + '-' 
                : wordsRemaining;
                
            page.drawText(lineText, {
                x: 20,
                y: 335 - (currentLine * 15),
                size: 8,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            if (wordsRemaining.length > maxLineLength) {
                wordsRemaining = wordsRemaining.substring(maxLineLength);
            } else {
                wordsRemaining = '';
            }
            
            currentLine++;
        }
        
        // Payment method
        const paymentMethod = order?.paymentMethod || 'Cash';
        const paymentStatus = order?.paymentStatus || 'Paid';
        
        page.drawText(`Payment Method: ${paymentMethod}`, {
            x: 15,
            y: 280,
            size: 9,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText(`Payment Status: ${paymentStatus}`, {
            x: 15,
            y: 265,
            size: 9,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Add signature sections
        page.drawText('Customer Signature:', {
            x: 15,
            y: 210,
            size: 9,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        // Line for signature
        page.drawLine({
            start: { x: 15, y: 180 },
            end: { x: 120, y: 180 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('Authorized Signature:', {
            x: 170,
            y: 210,
            size: 9,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        // Line for signature
        page.drawLine({
            start: { x: 170, y: 180 },
            end: { x: 275, y: 180 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });
        
        // Thank you note
        page.drawText('Thank you for your purchase!', {
            x: 75,
            y: 140,
            size: 10,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('Visit us again soon.', {
            x: 100,
            y: 125,
            size: 8,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Footer
        page.drawText('Goods once sold will not be taken back.', {
            x: 60,
            y: 30,
            size: 7,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating slip PDF bytes:', error);
        throw error;
    }
}