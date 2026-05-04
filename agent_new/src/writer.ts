import { promises as fs } from 'fs';
import path from 'path';
import { GeneratedFile } from './agent';

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

export async function writeTestFiles(
  outputPath: string,
  files: GeneratedFile[]
): Promise<string[]> {
  const writtenPaths: string[] = [];

  for (const file of files) {
    // Resolve full path
    const fullPath = path.resolve(outputPath, file.path);

    // Create directory if needed
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file.content, 'utf-8');

    writtenPaths.push(fullPath);
  }

  return writtenPaths;
}