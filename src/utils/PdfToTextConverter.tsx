import { getDocument , PDFDocumentProxy} from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

export class PdfToTextConverter {
    private file: File;
    private readonly batchSize = 5; // Number of pages to process at once
    private imageSources: string[] = []; // To store canvas elements

    constructor(file: File) {
        this.file = file;
    }

    async extractText(): Promise<string[]> {
        const url = URL.createObjectURL(this.file);
        const pdf = await getDocument(url).promise;
        let pagesText: string[] = [];
    
        for (let startPage = 1; startPage <= pdf.numPages; startPage += this.batchSize) {
            const endPage = Math.min(startPage + this.batchSize - 1, pdf.numPages);
            this.imageSources = await PdfToTextConverter.convertBatchOfPdfToImages(pdf, startPage, endPage);
            const batchTexts = await Promise.all(
                this.imageSources.map(source => this.performOCR(source))
            );
    
            // Add each page's text to the array
            for (let i = 0; i < batchTexts.length; i++) {
                pagesText.push(`Page ${startPage + i}:\n${batchTexts[i]}`);
            }
    
            this.clearStoredCanvases(); // Clear canvases to save memory
        }
    
        return pagesText;
    }
        

    static async convertBatchOfPdfToImages(pdf: PDFDocumentProxy, startPage: number, endPage: number): Promise<string[]> {
        const imageSources: string[] = [];

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
    
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            imageSources.push(canvas.toDataURL('image/jpeg'));
        }
    
        return imageSources;
    };

    static async renderImageOnCanvas(imageSources: string[], canvasRef: React.RefObject<HTMLCanvasElement>): Promise<HTMLImageElement | null> {
        return new Promise((resolve, reject) => {
            if (imageSources.length > 0 && canvasRef.current) {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    const image = new Image();
                    image.onload = () => {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        context.drawImage(image, 0, 0);
                        resolve(image); // Resolve the promise with the Image object
                    };
                    image.onerror = reject; // Reject the promise in case of an error
                    image.src = imageSources[0];
                } else {
                    reject(new Error("Canvas context not available"));
                }
            } else {
                reject(new Error("No image sources or canvas reference provided"));
            }
        });
    };
    

    private async performOCR(imageSource: string): Promise<string> {
        const { data: { text } } = await Tesseract.recognize(imageSource, 'eng');
        return text;
    }

    private clearStoredCanvases(): void {
        this.imageSources = [];
    }

    public getStoredCanvases(): string[] {
        return this.imageSources;
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
