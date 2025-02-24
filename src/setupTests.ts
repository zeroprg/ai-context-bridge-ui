// setupTests.ts


import '@testing-library/jest-dom';

// Patch the createObjectURL method on window.URL
// Polyfill URL.createObjectURL for Jest (patching window.URL)

Object.defineProperty(window.URL, 'createObjectURL', {
  configurable: true,
  writable: true,
  value: jest.fn(() => 'mock-pdf-url'),
});

// --- Your other mocks below ---

// Mock Clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
});

// If you need to mock PDF.js
jest.mock('pdfjs-dist', () => ({
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () =>
        Promise.resolve({
          getViewport: () => ({ width: 100, height: 100 }),
          render: () => ({ promise: Promise.resolve() }),
        }),
    }),
  }),
}));


const customGetContext = ((contextId: string, options?: any) => {
  if (contextId === "2d") {
    return ({
      fillRect: jest.fn(),
      drawImage: jest.fn(),
      putImageData: jest.fn(),
      getImageData: jest.fn(),
      createImageData: jest.fn(),
      canvas: document.createElement("canvas"),
      getContextAttributes: jest.fn(),
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      // Optionally, add stubs for additional methods (beginPath, clip, etc.)
    } as unknown) as CanvasRenderingContext2D;
  }
  if (contextId === "bitmaprenderer") {
    return ({
      transferFromImageBitmap: jest.fn(),
    } as unknown) as ImageBitmapRenderingContext;
  }
  return null;
}) as HTMLCanvasElement["getContext"];

HTMLCanvasElement.prototype.getContext = customGetContext;
