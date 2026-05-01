import { promises as fs } from 'fs';
import path from 'path';

export interface DetectedContext {
  testingLibrary: boolean;
  exampleTest: string | null;
  fileExtension: string;
}

export async function detectContext(
  modulePath: string,
): Promise<DetectedContext> {
  // Walk up directory tree to find package.json
  const packageJsonPath = await findPackageJson(path.dirname(modulePath));

  // Check for @testing-library/react
  let testingLibrary = false;
  if (packageJsonPath) {
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      testingLibrary = '@testing-library/react' in allDeps;
    } catch {
      // Continue with testingLibrary = false
    }
  }

  // Determine file extension
  const fileExtension = getTestExtension(modulePath);

  // Find existing test file for reference
  const exampleTest = await findExampleTest(path.dirname(modulePath));

  return {
    testingLibrary,
    exampleTest,
    fileExtension,
  };
}

async function findPackageJson(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  let levelsUp = 0;

  while (levelsUp < 5) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    try {
      await fs.access(packageJsonPath);
      return packageJsonPath;
    } catch {
      // File doesn't exist, go up one level
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached root
      break;
    }
    currentDir = parentDir;
    levelsUp++;
  }

  return null;
}

function getTestExtension(modulePath: string): string {
  const ext = path.extname(modulePath);
  switch (ext) {
    case '.tsx':
      return '.test.tsx';
    case '.ts':
      return '.test.ts';
    case '.jsx':
      return '.test.jsx';
    case '.js':
      return '.test.js';
    default:
      return '.test.ts';
  }
}

async function findExampleTest(moduleDir: string): Promise<string | null> {
  try {
    // Check sibling files for test patterns
    const siblings = await fs.readdir(moduleDir);
    const testFile = siblings.find(file =>
      file.includes('.test.') || file.includes('.spec.')
    );

    if (testFile) {
      const testFilePath = path.join(moduleDir, testFile);
      return await fs.readFile(testFilePath, 'utf-8');
    }

    // Check __tests__ directory
    const testsDir = path.join(moduleDir, '__tests__');
    try {
      const testFiles = await fs.readdir(testsDir);
      const firstTest = testFiles[0];
      if (firstTest) {
        const testFilePath = path.join(testsDir, firstTest);
        return await fs.readFile(testFilePath, 'utf-8');
      }
    } catch {
      // __tests__ directory doesn't exist
    }

    return null;
  } catch {
    return null;
  }
}