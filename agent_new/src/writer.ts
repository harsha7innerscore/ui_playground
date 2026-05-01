import { promises as fs } from 'fs';
import path from 'path';

export async function writeTestFile(
  modulePath: string,
  outputPath: string,
  testCode: string,
  fileExtension: string,
): Promise<string> {
  // Extract base filename without extension
  const basename = path.basename(modulePath, path.extname(modulePath));

  // Construct test filename
  const testFilename = `${basename}${fileExtension}`;

  // Construct full output file path
  const fullPath = path.join(outputPath, testFilename);

  // Write test code to file
  await fs.writeFile(fullPath, testCode, 'utf-8');

  return fullPath;
}