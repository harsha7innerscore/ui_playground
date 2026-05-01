#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { readFiles } from './reader.js';
import { detectContext } from './detector.js';
import { generateTests } from './agent.js';
import { writeTestFile } from './writer.js';

// Load environment variables
config();

async function main() {
  const program = new Command();

  program
    .name('react-test-gen-agent')
    .description('CLI agent that generates unit tests for React modules using Claude')
    .version('1.0.0')
    .requiredOption('--module-path <path>', 'Absolute or relative path to React component/module file')
    .requiredOption('--docs-path <path>', 'Absolute or relative path to docs file')
    .requiredOption('--output-path <path>', 'Directory where test file will be written')
    .option('--dry-run', 'If present, prints generated test to stdout instead of writing to disk');

  program.parse();

  const options = program.opts();

  try {
    // Check for required API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Error: ANTHROPIC_API_KEY environment variable is required');
      process.exit(1);
    }

    // Resolve all paths to absolute
    const modulePath = path.resolve(options.modulePath);
    const docsPath = path.resolve(options.docsPath);
    const outputPath = path.resolve(options.outputPath);

    // Validate that module and docs files exist
    try {
      await fs.access(modulePath);
    } catch {
      console.error(`Error: Module file not found: ${modulePath}`);
      process.exit(1);
    }

    try {
      await fs.access(docsPath);
    } catch {
      console.error(`Error: Docs file not found: ${docsPath}`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    await fs.mkdir(outputPath, { recursive: true });

    // Step 1: Read files
    console.log('Reading module and docs files...');
    const { moduleContent, docsContent } = await readFiles(modulePath, docsPath);

    // Step 2: Detect context
    console.log('Detecting test framework and context...');
    const context = await detectContext(modulePath);

    // Step 3: Generate tests with Claude
    console.log('Generating tests with Claude...');
    const moduleName = path.basename(modulePath, path.extname(modulePath));
    const testCode = await generateTests({
      moduleContent,
      docsContent,
      testingLibrary: context.testingLibrary,
      exampleTest: context.exampleTest,
      moduleName,
    });

    // Step 4: Write or print test file
    if (options.dryRun) {
      console.log('\n--- Generated Test File ---\n');
      console.log(testCode);
    } else {
      console.log('Writing test file...');
      const writtenPath = await writeTestFile(
        modulePath,
        outputPath,
        testCode,
        context.fileExtension
      );
      console.log(`✅ Test file written to: ${writtenPath}`);
    }

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});