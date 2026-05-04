import { promises as fs } from 'fs';

export async function readFiles(
  modulePath: string,
  docsPath: string,
  errorPath?: string,
): Promise<{ moduleContent: string; docsContent: string; errorContent?: string }> {
  try {
    const moduleContent = await fs.readFile(modulePath, 'utf-8');
    const docsContent = await fs.readFile(docsPath, 'utf-8');

    let errorContent: string | undefined;
    if (errorPath) {
      try {
        errorContent = await fs.readFile(errorPath, 'utf-8');
      } catch (error: any) {
        console.warn(`Warning: Could not read error docs file: ${error.message}`);
      }
    }

    return { moduleContent, docsContent, errorContent };
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}