import { getDocument , PDFDocumentProxy} from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

export class PdfToTextConverter {
    private file: File;
    private readonly batchSize = 5; // Number of pages to process at once
    private canvasElements: HTMLCanvasElement[] = []; // To store canvas elements

    constructor(file: File) {
        this.file = file;
    }

    async extractText(): Promise<string> {
        const url = URL.createObjectURL(this.file);
        const pdf = await getDocument(url).promise;
        let fullText = '';
    
        for (let startPage = 1; startPage <= pdf.numPages; startPage += this.batchSize) {
            const endPage = Math.min(startPage + this.batchSize - 1, pdf.numPages);
            const imageSources = await this.convertBatchOfPdfToImages(pdf, startPage, endPage);
            const batchTexts = await Promise.all(
                imageSources.map(source => this.performOCR(source))
            );
    
            // Append each page's text with its index
            for (let i = 0; i < batchTexts.length; i++) {
                fullText += `Page ${startPage + i}:\n${batchTexts[i]}\n\n`;
            }
    
            this.clearStoredCanvases(); // Clear canvases to save memory
        }
    
        return fullText;
    }
    

    private async convertBatchOfPdfToImages(pdf: PDFDocumentProxy, startPage: number, endPage: number): Promise<string[]> {
        const imageSources: string[] = [];

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            imageSources.push(canvas.toDataURL('image/jpeg'));

            this.canvasElements.push(canvas); // Store canvas for potential display
        }

        return imageSources;
    }

    private async performOCR(imageSource: string): Promise<string> {
        const { data: { text } } = await Tesseract.recognize(imageSource, 'eng');
        return text;
    }

    private clearStoredCanvases(): void {
        this.canvasElements = [];
    }

    public getStoredCanvases(): HTMLCanvasElement[] {
        return this.canvasElements;
    }
}

export default PdfToTextConverter;
// Example usage
//const file = /* your PDF file */;
//const converter = new PdfToTextConverter(file);
//converter.extractText().then(texts => {
//    console.log('Extracted Texts:', texts);

    // To get the canvases for display
//    const canvases = converter.getStoredCanvases();
    // ... code to display canvases in the browser
//});
