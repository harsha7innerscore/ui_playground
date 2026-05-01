import { promises as fs } from 'fs';

export async function readFiles(
  modulePath: string,
  docsPath: string,
): Promise<{ moduleContent: string; docsContent: string }> {
  try {
    const moduleContent = await fs.readFile(modulePath, 'utf-8');
    const docsContent = await fs.readFile(docsPath, 'utf-8');

    return { moduleContent, docsContent };
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}