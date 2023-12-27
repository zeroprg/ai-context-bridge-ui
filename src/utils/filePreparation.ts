// filePreparation.ts
import { getDocument } from 'pdfjs-dist';
import PdfToTextConverter from './PdfToTextConverter';
import { getContext, storeContext, queryIndex } from './llama';

export async function query(query: string) {
 // const indexId = await getContext();
 // const response = await queryIndex(query);
  return null;
}

const TEXT_CONTENT_THRESHOLD = 50; // Percentage


export async function prepareFileContentAsString(file: File): Promise<string[]> {
    if (file.type.startsWith('text/')) {
        const text = await prepareTextFileContent(file);
        return [text];
    } else if (file.type === 'application/pdf') {
        const { isImageBased, textContents } = await checkPdfContent(file);
        if (isImageBased) {
            const converter = new PdfToTextConverter(file);
            const text = await converter.extractText();
            return [text];
        } else {
            return [textContents.join(' ')];
        }
    }

    return [];
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
