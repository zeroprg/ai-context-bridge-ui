// filePreparation.ts

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';



// ^ This import syntax depends on your bundler. 
// If your bundler doesn't support '?url', see notes below.

import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import PdfToTextConverter from './PdfToTextConverter';
import { API_URLS } from '../apiConstants';



// 1) Configure the PDF.js worker
// Set the worker source to the file in your public folder:
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

// You can tweak this threshold to decide how many pages must have text
// before deciding a PDF is text-based vs. image-based.
const TEXT_CONTENT_THRESHOLD = 50; // Percentage

/**
 * Main entry point: parse the given File based on its MIME type,
 * returning an array of strings (one entry per chunk of text).
 */
export async function prepareFileContent(file: File): Promise<string[]> {
  // 2) Check type and delegate
  if (file.type.startsWith('text/')) {
    const text = await prepareTextFileContent(file);
    return [text];

  } else if (file.type === 'application/pdf') {
    // PDF logic
    const { isImageBased, textContents } = await checkPdfContent(file);
    if (isImageBased) {
      // Use your PdfToTextConverter-based approach (OCR, etc.)
      const converter = new PdfToTextConverter(file);
      const text: string[] = await converter.extractText();
      return text;
    } else {
      return textContents;
    }

  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // .docx
    // Ensure mammoth is loaded
    if (typeof mammoth === 'undefined') {
      await loadMammothScript();
    }
    return await prepareDocxFileContent(file);

  } else if (file.type === 'application/msword') {
    // .doc (MIME: application/msword)
    // Mammoth does NOT support .doc. You could either:
    //  1) Throw an error
    //  2) Convert .doc -> .docx server-side
    // For now, we throw an error:
    throw new Error("Unsupported .doc format. Please convert to .docx.");

  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'text/csv'
  ) {
    // Excel (.xlsx) or CSV
    return await prepareExcelCsvFileContent(file);

  } else if (file.type.startsWith('image/')) {
    // Image (OCR)
    return await processImageFile(file);

  } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    // Audio/Video -> server-based transcription
    return await processAudioFile(API_URLS.HttpAudioTranscript, file);

  } else {
    // If none matched, throw
    throw new Error(`Unsupported file type: ${file.type}`);
  }
}

/**
 * Handle plain text files
 */
export async function prepareTextFileContent(file: File): Promise<string> {
  const fileContent = await file.text();
  return `File Name: ${file.name}\n\n${fileContent}`;
}

/**
 * Check a PDF to see if it's mostly text or mostly image-based.
 */
async function checkPdfContent(file: File): Promise<{ isImageBased: boolean; textContents: string[] }> {
  // Convert to object URL and parse with pdfjs-dist
  const pdf = await getDocument({ url: URL.createObjectURL(file) }).promise;
  let textPagesCount = 0;
  let textContents: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Join all text items
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    textContents.push(pageText);

    if (textContent.items.length > 0) {
      textPagesCount++;
    }
  }

  const textPagePercentage = (textPagesCount / pdf.numPages) * 100;
  const isImageBased = textPagePercentage < TEXT_CONTENT_THRESHOLD;

  return { isImageBased, textContents };
}

/**
 * For .docx files, use Mammoth to extract text
 */
async function prepareDocxFileContent(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  // Return lines (split by newline) or a single chunk
  return result.value.split('\n');
}

/**
 * For Excel (.xlsx) and CSV, parse with XLSX
 */
async function prepareExcelCsvFileContent(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
  let allSheets: string[] = [];

  workbook.SheetNames.forEach((sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const sheetData = {
      sheetName,
      data: jsonData
    };
    // Convert each sheet's data to a JSON string
    allSheets.push(JSON.stringify(sheetData, null, 2));
  });

  return allSheets;
}

/**
 * OCR on image files using Tesseract
 */
async function processImageFile(file: File): Promise<string[]> {
  try {
    const result = await Tesseract.recognize(file, 'eng');
    return [result.data.text];
  } catch (error) {
    console.error('Error processing image file:', error);
    throw error;
  }
}

/**
 * Audio/Video transcription via server
 */
async function processAudioFile(serverUrl: string, file: File): Promise<string[]> {
  const responseData = await sendAudioToServer(serverUrl, file);
  return [responseData];
}

async function sendAudioToServer(serverUrl: string, audioFile: File): Promise<string> {
  if (audioFile.size > 0) {
    const formData = new FormData();
    formData.append('audioFile', audioFile, audioFile.name);
    try {
      const response = await axios.post(serverUrl, formData, { withCredentials: true });
      return response.data; // Return response data (assumed text)
    } catch (error: any) {
      throw new Error(`${error.message} or file is too big: ${audioFile.size}`);
    }
  } else {
    throw new Error("The audio file is empty.");
  }
}

/**
 * Dynamically load Mammoth (for .docx parsing) if not already available
 */
function loadMammothScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/mammoth/mammoth.browser.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load mammoth script'));
    document.head.appendChild(script);
  });
}