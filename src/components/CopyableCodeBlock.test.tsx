
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import CopyableCodeBlock from './CopyableCodeBlock';

// Mock html2canvas
jest.mock('html2canvas', () => () => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,mock',
  width: 100,
  height: 100
}));

// Mock jspdf
jest.mock('jspdf', () => ({
  jsPDF: class {
    addImage = jest.fn();
    output = () => new Blob(['Mock PDF'], { type: 'application/pdf' });
    setFillColor = jest.fn();
    rect = jest.fn();
    setFont = jest.fn();
    setTextColor = jest.fn();
    text = jest.fn();
  }
}));

const TEST_CODE = {
  python: 'def hello():\n    print("Hello World")',
  shell: '#!/bin/bash\necho "Hello from Bash"',
  rust: 'fn main() {\n    println!("Hello Rust");\n}',
  typescript: 'type User = {\n    id: string;\n    name: string;\n}'
};

describe('CopyableCodeBlock Component', () => {
  beforeAll(() => {
    // Setup a mock for clipboard.writeText
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
  });

  test('renders Python code with correct styling', () => {
    render(<CopyableCodeBlock>{TEST_CODE.python}</CopyableCodeBlock>);
    expect(screen.getByText(/def hello/)).toBeInTheDocument();
  });

  test('copies content to clipboard', async () => {
    render(<CopyableCodeBlock>{TEST_CODE.rust}</CopyableCodeBlock>);
    
    // Change query to match the aria-label "Copy code"
    const copyButton = screen.getByRole('button', { 
      name: /copy code/i 
    });
    
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'fn main() {\n    println!("Hello Rust");\n}'
      );
    });
  });


  test('shows PDF preview on conversion', async () => {
    render(<CopyableCodeBlock>{TEST_CODE.typescript}</CopyableCodeBlock>);
  
    const pdfButton = screen.getByRole('button', { name: /generate pdf/i });
    await act(async () => {
      fireEvent.click(pdfButton);
    });
  
    // Wait for the PDF preview iframe (with title "PDF preview") to appear
    const pdfPreview = await waitFor(() => screen.getByTitle('PDF preview'), { timeout: 10000 });
    expect(pdfPreview).toBeInTheDocument();
    expect(pdfPreview).toHaveAttribute('src', 'mock-pdf-url');
  });
});