// filePreparation.ts
import { getDocument } from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';

import PdfToTextConverter from './PdfToTextConverter';

export async function query(query: string) {
 // const indexId = await getContext();
 // const response = await queryIndex(query);
  return null;
}

const TEXT_CONTENT_THRESHOLD = 50; // Percentage


export async function prepareFileContent(file: File): Promise<string[]> {
    if (file.type.startsWith('text/')) {
        const text = await prepareTextFileContent(file);
        return [text];
    } else if (file.type === 'application/pdf') {
        const { isImageBased, textContents } = await checkPdfContent(file);
        if (isImageBased) {
            const converter = new PdfToTextConverter(file);
            const text: string[] = await converter.extractText();
            return text;
        } else {
            return textContents;
        }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {

        // Check if mammoth is already loaded
        if (typeof mammoth === 'undefined') {
            await loadMammothScript();
        }

        // Handle .docx files
        return await prepareDocxFileContent(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'text/csv') {
        // Handle .xlsx and .csv files
        return await prepareExcelCsvFileContent(file);
    } else if (file.type.startsWith('image/')) {
        // Process image file
        return await processImageFile(file);
    } else {
        console.log('Unsupported file type');
    }

    return [];
}

async function processImageFile(file: File): Promise<string[]> {
    try {
        const result = await Tesseract.recognize(file, 'eng');
        const text = result.data.text;
        return [text]; // Returning the recognized text in an array
    } catch (error) {
        console.error('Error processing image file:', error);
        return [];
    }
}

function loadMammothScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/mammoth/mammoth.browser.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load mammoth script'));
        document.head.appendChild(script);
    });
}

async function prepareDocxFileContent(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.split('\n'); // Splitting text into lines
}

async function prepareExcelCsvFileContent(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    let allSheets: string[] = [];

    workbook.SheetNames.forEach((sheetName: string) => { 
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const sheetData = {
            sheetName: sheetName,
            data: jsonData
        };
        allSheets.push(JSON.stringify(sheetData, null, 2)); // Convert each sheet's data to a JSON string
    });

    return allSheets;
}

async function checkPdfContent(file: File): Promise<{ isImageBased: boolean; textContents: string[] }> {
    const pdf = await getDocument({ url: URL.createObjectURL(file) }).promise;
    let textPagesCount = 0;
    let textContents: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent: any = await page.getTextContent();
        textContents.push(textContent.items.map((item : any)=> item.str).join(' '));

        if (textContent.items.length > 0) {
            textPagesCount++;
        }
    }

    const textPagePercentage = (textPagesCount / pdf.numPages) * 100;
    const isImageBased = textPagePercentage < TEXT_CONTENT_THRESHOLD;

    return { isImageBased, textContents };
}


export async function prepareTextFileContent(file: File): Promise<string> {
    const fileContent = await file.text();
    return `File Name: ${file.name}\n\n${fileContent}`;
}
