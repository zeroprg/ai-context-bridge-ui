// filePreparation.ts

/**
 * Reads a text file and appends additional text to its content.
 * @param file The file to be processed.
 * @param appendText The text to append to the file content.
 * @returns A Promise resolving to a string representing the processed content.
 */
export async function prepareTextFileContent(file: File, appendText: string): Promise<string> {
    const fileContent = await file.text();
    return `File Name: ${file.name}\n\n${fileContent}\n\nMessage: ${appendText}`;
}

/**
 * Handles the preparation of file content as a string.
 * @param file The file to be processed.
 * @param additionalData Data to be appended or used in processing.
 * @returns A Promise resolving to a string.
 */
export async function prepareFileContentAsString(file: File, additionalData: string): Promise<string> {
    // For text files, read and append the additional data
    if (file.type.startsWith('text/')) {
        return prepareTextFileContent(file, additionalData);
    }

    // For other file types, you'll need specific handling
    // ...

    // If the file type is not supported, you might return an error or a default string
    return `Unsupported file type for: ${file.name}`;
}
