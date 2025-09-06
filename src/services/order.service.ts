import { Order } from "../models/order.model";
import { IOrder } from "../types/order";
import mongoose from "mongoose";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const createOrderData = async (data: IOrder) => {
    try {
        const newData = new Order(data);
        await newData.save();
        return newData;
    } catch (error) {
        console.error('Error creating order data:', error);
        throw error;
    }
}

export const getOrderData = async (ownerId: string) => {
    try {
        const data = await Order.aggregate([
            {
                $match: {
                    ownerId: ownerId,
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                }
            },
            // Convert customerId to ObjectId for lookup
            {
                $addFields: {
                    customerObjectId: {
                        $cond: [
                            { $regexMatch: { input: "$customerId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$customerId" },
                            null
                        ]
                    }
                }
            },
            // Lookup customer data
            {
                $lookup: {
                    from: "Customer",
                    localField: "customerObjectId",
                    foreignField: "_id",
                    as: "customerData"
                }
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            // Unwind products to process each order item
            { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "products.productObjectId": {
                        $cond: [
                            { $regexMatch: { input: "$products.productId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$products.productId" },
                            null
                        ]
                    },
                    "products.variantObjectId": {
                        $cond: [
                            { $regexMatch: { input: "$products.variantId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$products.variantId" },
                            null
                        ]
                    }
                }
            },
            // Lookup product
            {
                $lookup: {
                    from: "Product",
                    localField: "products.productObjectId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $addFields: {
                    "products.productData": { $arrayElemAt: ["$productData", 0] }
                }
            },
            // Extract the correct variant from productData.variants
            {
                $addFields: {
                    "products.variantData": {
                        $let: {
                            vars: {
                                variants: "$products.productData.variants"
                            },
                            in: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$variants",
                                            as: "variant",
                                            cond: { $eq: ["$$variant._id", "$products.variantObjectId"] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            },
            // Group back to orders with products array and extra payment fields
            {
                $group: {
                    _id: "$_id",
                    ownerId: { $first: "$ownerId" },
                    userId: { $first: "$userId" },
                    customerType: { $first: "$customerType" },
                    customerId: { $first: "$customerId" },
                    subTotal: { $first: "$subTotal" },
                    totalGst: { $first: "$totalGst" },
                    roundOff: { $first: "$roundOff" },
                    total: { $first: "$total" },
                    paymentMethod: { $first: "$paymentMethod" },
                    paymentStatus: { $first: "$paymentStatus" },
                    // Add extra payment fields in group
                    cardNumber: { $first: "$cardNumber" },
                    upiTransactionId: { $first: "$upiTransactionId" },
                    chequeNumber: { $first: "$chequeNumber" },
                    gatewayTransactionId: { $first: "$gatewayTransactionId" },
                    bankReferenceNumber: { $first: "$bankReferenceNumber" },
                    invoiceNumber: { $first: "$invoiceNumber" },
                    notes: { $first: "$notes" },
                    isDeleted: { $first: "$isDeleted" },
                    captureDate: { $first: "$captureDate" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    customerData: { $first: "$customerData" },
                    products: {
                        $push: {
                            productId: "$products.productId",
                            variantId: "$products.variantId",
                            unit: "$products.unit",
                            carton: "$products.carton",
                            quantity: "$products.quantity",
                            mrp: "$products.mrp",
                            price: "$products.price",
                            gstRate: "$products.gstRate",
                            gstAmount: "$products.gstAmount",
                            total: "$products.total",
                            productData: "$products.productData",
                            variantData: "$products.variantData"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    ownerId: 1,
                    userId: 1,
                    customerType: 1,
                    customerId: 1,
                    subTotal: 1,
                    totalGst: 1,
                    roundOff: 1,
                    total: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    // Project extra payment fields
                    cardNumber: 1,
                    upiTransactionId: 1,
                    chequeNumber: 1,
                    gatewayTransactionId: 1,
                    bankReferenceNumber: 1,
                    products: 1,
                    invoiceNumber: 1,
                    notes: 1,
                    isDeleted: 1,
                    captureDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    customerData: 1
                }
            }
        ]);
        return data;
    } catch (error) {
        console.error('Error fetching order data:', error);
        throw error;
    }
}

export const updateOrderData = async (data: IOrder) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());

        // List of mutually exclusive payment fields
        const exclusiveFields = [
            "cardNumber",
            "upiTransactionId",
            "chequeNumber",
            "gatewayTransactionId",
            "bankReferenceNumber"
        ];

        // Find which payment field is present in the update
        const presentField = exclusiveFields.find(field => data[field as keyof IOrder]);

        // Prepare $set and $unset objects
        const setFields: any = {};
        const unsetFields: any = {};

        // Set the present field, unset the rest
        exclusiveFields.forEach(field => {
            if (field === presentField && data[field as keyof IOrder]) {
                setFields[field] = data[field as keyof IOrder];
            } else {
                unsetFields[field] = "";
            }
        });

        // Add other fields to $set
        Object.keys(data).forEach(key => {
            if (!exclusiveFields.includes(key) && key !== "_id") {
                setFields[key] = data[key as keyof IOrder];
            }
        });

        const updateObj: any = {};
        if (Object.keys(setFields).length) updateObj.$set = setFields;
        if (Object.keys(unsetFields).length) updateObj.$unset = unsetFields;

        const result = await Order.findByIdAndUpdate(documentId, updateObj, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteOrderData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Order.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
}

export const getAllOrderDataByCustomerId = async (customerId: string) => {
    try {
        const orders = await Order.find({ customerId, isDeleted: false });
        return orders;
    } catch (error) {
        console.error('Error fetching orders by customer ID:', error);
        throw error;
    }
}

export const getOrderById = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const order = await Order.findById(documentId);
        return order;
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
}

export const generateInvoicePdfBytes = async (orderData?: any) => {
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

        // Helper functions
        const createPageHeader = (page: any, pageNumber: number, totalPages: number) => {
            page.drawRectangle({
                x: MARGIN_X,
                y: 50,
                width: CONTENT_WIDTH,
                height: PAGE_HEIGHT - 100,
                color: rgb(1, 1, 1),
                borderWidth: 1,
                borderColor: rgb(0.5, 0.5, 0.5),
            });
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 150,
                width: CONTENT_WIDTH,
                height: 100,
                color: rgb(0.97, 0.97, 0.97),
                borderWidth: 1,
                borderColor: rgb(0.5, 0.5, 0.5),
            });
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 140,
                width: 80,
                height: 80,
                borderWidth: 1,
                borderColor: rgb(0.7, 0.7, 0.7),
                color: rgb(0.95, 0.95, 0.95),
            });
            page.drawText('RETAIL INVOICE', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 105,
                size: 14,
                font: timesBoldFont,
                color: rgb(0, 0, 0),
            });
            page.drawText('SARTHI AGROTECH', {
                x: PAGE_WIDTH / 2 - 250,
                y: PAGE_HEIGHT - 80,
                size: 24,
                font: timesBoldFont,
                color: rgb(0, 0, 0),
            });

            //company address set right side top corner
            const companyAddress = '123 Pharmacy Street, Medical District, City - 380001';
            const companyAddressWidth = timesRomanFont.widthOfTextAtSize(companyAddress, 10);
            page.drawText(companyAddress, {
                x: PAGE_WIDTH - companyAddressWidth - 60,
                y: PAGE_HEIGHT - 70,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            // mobile number set below company address
            const companyMobileNumber = 'Mobile: +91 9876543210';
            const companyMobileNumberWidth = timesRomanFont.widthOfTextAtSize(companyMobileNumber, 10);

            page.drawText(companyMobileNumber, {
                x: PAGE_WIDTH - companyMobileNumberWidth - 60,
                y: PAGE_HEIGHT - 85,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            // gst number set below mobile number
            const companyGSTNumber = 'GST No: 24ABCDE1234F1Z5';
            const companyGSTNumberWidth = timesRomanFont.widthOfTextAtSize(companyGSTNumber, 10);
            page.drawText(companyGSTNumber, {
                x: PAGE_WIDTH - companyGSTNumberWidth - 60,
                y: PAGE_HEIGHT - 100,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            // drug license set below gst number
            const companyDrugLicense = 'Drug License: GJ-12345';
            const companyDrugLicenseWidth = timesRomanFont.widthOfTextAtSize(companyDrugLicense, 10);
            page.drawText(companyDrugLicense, {
                x: PAGE_WIDTH - companyDrugLicenseWidth - 60,
                y: PAGE_HEIGHT - 115,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            // Invoice details and customer info
            page.drawText(`Invoice #: ${order.invoiceNumber || 'INV-2023-001'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 170,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            const orderDate = order.captureDate ? new Date(order.captureDate).toLocaleDateString() : new Date().toLocaleDateString();
            page.drawText('Date: ' + orderDate, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 190,
                size: 12,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            page.drawRectangle({
                x: MARGIN_X,
                y: PAGE_HEIGHT - 250,
                width: CONTENT_WIDTH,
                height: 50,
                color: rgb(0.97, 0.97, 0.97),
                borderWidth: 1,
                borderColor: rgb(0.5, 0.5, 0.5),
            });
            page.drawText('Bill To:', {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 220,
                size: 12,
                font: timesBoldFont,
                color: rgb(0, 0, 0),
            });
            page.drawText(`Name: ${order.customerData?.name || 'Customer Name'}`, {
                x: MARGIN_X + 10,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            const customerAddress = order.customerData?.address || 'Customer Address';
            const fullCustomerAddress = `Address: ${customerAddress}`;
            const customerAddressWidth = timesRomanFont.widthOfTextAtSize(fullCustomerAddress, 10);
            page.drawText(fullCustomerAddress, {
                x: PAGE_WIDTH / 2 - customerAddressWidth / 2,
                y: PAGE_HEIGHT - 240,
                size: 10,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            if (order.customerData?.mobile) {
                page.drawText(`Mobile: ${order.customerData.mobile}`, {
                    x: PAGE_WIDTH - 145,
                    y: PAGE_HEIGHT - 240,
                    size: 10,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
            }
            return PAGE_HEIGHT - HEADER_HEIGHT;
        };

        const createTableHeaders = (page: any, startY: number, isLastPage: boolean) => {
            // Draw table header (colored bar)
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: startY - TABLE_HEADER_HEIGHT,
                width: CONTENT_WIDTH - 20,
                height: TABLE_HEADER_HEIGHT,
                color: rgb(0.9, 0.9, 0.9),
                borderWidth: 1,
                borderColor: rgb(0, 0, 0),
            });
            
            // Always use fixed table height for 15 rows, regardless of actual items count
            const tableHeight = FIXED_TABLE_HEIGHT;
            
            // Draw table background
            page.drawRectangle({
                x: MARGIN_X + 10,
                y: startY - tableHeight,
                width: CONTENT_WIDTH - 20,
                height: tableHeight,
                borderWidth: 1,
                borderColor: rgb(0, 0, 0),
                color: rgb(1, 1, 1),
            });
            
            // Column positions
            const columnPositions = [
                MARGIN_X + 10,
                MARGIN_X + 50,
                MARGIN_X + 190,
                MARGIN_X + 290,
                MARGIN_X + 380,
                MARGIN_X + 460,
                MARGIN_X + 530,
                MARGIN_X + 600,
                MARGIN_X + CONTENT_WIDTH - 10
            ];
            
            // Draw vertical grid lines for all 15 rows
            for (let i = 0; i < columnPositions.length; i++) {
                page.drawLine({
                    start: { x: columnPositions[i], y: startY },
                    end: { x: columnPositions[i], y: startY - tableHeight },
                    thickness: 1,
                    color: rgb(0, 0, 0),
                });
            }
            
            // Draw header separator line
            page.drawLine({
                start: { x: MARGIN_X + 10, y: startY - TABLE_HEADER_HEIGHT },
                end: { x: MARGIN_X + CONTENT_WIDTH - 10, y: startY - TABLE_HEADER_HEIGHT },
                thickness: 1,
                color: rgb(0, 0, 0),
            });
            
            // Draw horizontal grid lines for all 15 rows
            for (let i = 1; i <= MAX_ITEMS; i++) {
                page.drawLine({
                    start: { x: MARGIN_X + 10, y: startY - TABLE_HEADER_HEIGHT - (i * ITEM_HEIGHT) },
                    end: { x: MARGIN_X + CONTENT_WIDTH - 10, y: startY - TABLE_HEADER_HEIGHT - (i * ITEM_HEIGHT) },
                    thickness: 0.5,
                    color: rgb(0.5, 0.5, 0.5),
                });
            }
            
            // Draw column headers
            const headerY = startY - 15;
            const fontSize = 10;
            page.drawText('S.No', { x: MARGIN_X + 20, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Item Name', { x: MARGIN_X + 60, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Manufacturer', { x: MARGIN_X + 200, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Batch No.', { x: MARGIN_X + 300, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Packing', { x: MARGIN_X + 390, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Price', { x: MARGIN_X + 470, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Qty', { x: MARGIN_X + 540, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            page.drawText('Total', { x: MARGIN_X + 610, y: headerY, size: fontSize, font: timesBoldFont, color: rgb(0, 0, 0), });
            
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

        const addPageFooter = (page: any, yPosition: number, isLastPage: boolean) => {
            if (isLastPage) {
                const footerY = 170;
                page.drawRectangle({
                    x: MARGIN_X + CONTENT_WIDTH - 170,
                    y: footerY + 90,
                    width: 160,
                    height: 25,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    color: rgb(0.9, 0.9, 0.9),
                });
                page.drawText('Total:', {
                    x: MARGIN_X + CONTENT_WIDTH - 160,
                    y: footerY + 97,
                    size: 12,
                    font: timesBoldFont,
                    color: rgb(0, 0, 0),
                });
                const finalTotal = order.total;
                page.drawText(formatCurrency(finalTotal), {
                    x: MARGIN_X + CONTENT_WIDTH - 100,
                    y: footerY + 97,
                    size: 12,
                    font: timesBoldFont,
                    color: rgb(0, 0, 0),
                });
                if (order.totalGst) {
                    page.drawRectangle({
                        x: MARGIN_X + CONTENT_WIDTH - 170,
                        y: footerY + 55,
                        width: 160,
                        height: 25,
                        borderWidth: 1,
                        borderColor: rgb(0, 0, 0),
                        color: rgb(0.9, 0.9, 0.9),
                    });
                    page.drawText('GST:', {
                        x: MARGIN_X + CONTENT_WIDTH - 160,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: rgb(0, 0, 0),
                    });
                    page.drawText(formatCurrency(order.totalGst), {
                        x: MARGIN_X + CONTENT_WIDTH - 100,
                        y: footerY + 62,
                        size: 12,
                        font: timesBoldFont,
                        color: rgb(0, 0, 0),
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
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                    color: rgb(0.95, 0.95, 0.95),
                });
                page.drawText(
                    'Important: Goods once sold will not be taken back or exchanged. Subject to local jurisdiction.',
                    {
                        x: MARGIN_X + 50,
                        y: 70,
                        size: 9,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
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
            borderWidth: 1,
            borderColor: rgb(0.5, 0.5, 0.5),
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
        
        // Add footer
        addPageFooter(page, table.startY - table.tableHeight - 20, true);
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating invoice PDF bytes:', error);
        throw error;
    }
}

//

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