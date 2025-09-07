import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { generateRetailInvoicePdfBytes, generateSlipPdfBytes, generateWholesaleInvoicePdfBytes } from "../services/invoice.service";

export const generateRetailInvoicePdf = async (req: AuthorizedRequest, res: Response) => {
    try {
        const pdfBytes = await generateRetailInvoicePdfBytes();
        
        // Set proper headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBytes.length,
            'Content-Disposition': 'inline; filename="invoice_retail.pdf"'
        });
        
        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const generateWholesaleInvoicePdf = async (req: AuthorizedRequest, res: Response) => {
    try {
        const pdfBytes = await generateWholesaleInvoicePdfBytes(); // Assuming same function for wholesale, modify if needed

        // Set proper headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBytes.length,
            'Content-Disposition': 'inline; filename="invoice_wholesale.pdf"'
        });
        
        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating wholesale invoice PDF:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const generateSlipPdf = async (req: AuthorizedRequest, res: Response) => {
    try {
        const pdfBytes = await generateSlipPdfBytes();

        // Set proper headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBytes.length,
            'Content-Disposition': 'inline; filename="slip.pdf"'
        });

        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating slip PDF:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}