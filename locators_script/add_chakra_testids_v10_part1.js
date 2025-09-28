#!/usr/bin/env node

/**
 * add_chakra_testids_v10.js
 *
 * Advanced script to automatically add semantically meaningful data-testid attributes
 * to both Chakra UI elements and standard HTML5 elements in a JSX file.
 *
 * New features in v10:
 * 1. Advanced component hierarchy analysis for contextual test IDs
 * 2. Smart detection of logical component groups (forms, navigation, etc.)
 * 3. Component state-aware test ID generation (active, loading, disabled, etc.)
 * 4. Enhanced semantic meaning extraction from props and children
 * 5. Template literal support for dynamic element arrays
 * 6. Deep prop analysis for more meaningful component descriptions
 * 7. Multi-framework support with framework-specific optimizations
 * 8. Component role inference using advanced heuristics
 * 9. Conditional rendering pattern detection
 * 10. All v9 features including path-based context and fingerprinting
 *
 * Usage: node add_chakra_testids_v10.js <input-file.jsx> [options]
 * Options:
 *   --include-html: Add data-testid to standard HTML elements (default: true)
 *   --html-only: Only process HTML elements, ignore Chakra components
 *   --chakra-only: Only process Chakra components, ignore HTML elements
 *   --comment-based: Use nearby comments for naming (default: true)
 *   --text-based: Use text content for naming (default: true)
 *   --verbose: Show detailed information about each test ID generated
 *   --output-dir: Specify an output directory (default: locators_script/results)
 *   --batch: Process all JSX files in a directory
 *   --no-class-based: Disable using className for test ID generation
 *   --no-sx-based: Disable using sx prop for test ID generation
 *   --no-path-context: Disable using path context for test ID uniqueness
 *   --state-aware: Enable state-aware test ID generation (default: true)
 *   --deep-props: Enable deep prop analysis for better component descriptions (default: true)
 *   --group-detection: Enable logical component group detection (default: true)
 *   --role-inference: Enable advanced role inference for components (default: true)
 *   --condition-aware: Enable condition-aware test ID generation (default: true)
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const readline = require('readline');

// Check for input file
const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Please provide an input file: node add_chakra_testids_v10.js <input-file.jsx> [options]');
  process.exit(1);
}

// Process options
const options = {
  includeHtml: true,      // Default to including HTML elements
  htmlOnly: false,
  chakraOnly: false,
  commentBased: true,     // Use comments for naming
  textBased: true,        // Use text content for naming
  verbose: false,         // Detailed output
  prefix: '',             // Will be set by user input
  outputDir: 'locators_script/results',  // Default output directory
  batch: false,           // Process all JSX files in a directory
  classBased: true,       // Use className for test ID generation
  sxBased: true,          // Use sx prop for test ID generation
  pathContext: true,      // Use path context for test ID uniqueness
  useChildText: true,     // Use text from child elements for parent context
  prioritizeText: true,   // Prioritize text content over other attributes
  stateAware: true,       // Generate state-aware test IDs
  deepProps: true,        // Perform deep prop analysis
  groupDetection: true,   // Detect logical component groups
  roleInference: true,    // Use advanced role inference
  conditionAware: true,   // Handle conditional rendering patterns
};

// Process command line arguments
for (let i = 1; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--include-html') options.includeHtml = true;
  else if (arg === '--html-only') {
    options.htmlOnly = true;
    options.chakraOnly = false;
  }
  else if (arg === '--chakra-only') {
    options.chakraOnly = true;
    options.htmlOnly = false;
    options.includeHtml = false;
  }
  else if (arg === '--no-comment-based') options.commentBased = false;
  else if (arg === '--no-text-based') options.textBased = false;
  else if (arg === '--no-class-based') options.classBased = false;
  else if (arg === '--no-sx-based') options.sxBased = false;
  else if (arg === '--no-path-context') options.pathContext = false;
  else if (arg === '--no-child-text') options.useChildText = false;
  else if (arg === '--no-prioritize-text') options.prioritizeText = false;
  else if (arg === '--no-state-aware') options.stateAware = false;
  else if (arg === '--no-deep-props') options.deepProps = false;
  else if (arg === '--no-group-detection') options.groupDetection = false;
  else if (arg === '--no-role-inference') options.roleInference = false;
  else if (arg === '--no-condition-aware') options.conditionAware = false;
  else if (arg === '--verbose') options.verbose = true;
  else if (arg === '--batch') options.batch = true;
  else if (arg === '--output-dir' && i + 1 < args.length) {
    options.outputDir = args[i + 1];
    i++;
  }
}

// Always prompt the user for a prefix
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a prefix for test IDs (e.g., "task-page" or "user-profile"): ', (answer) => {
  options.prefix = answer.trim();
  rl.close();

  if (options.batch) {
    processBatch();
  } else {
    processFile();
  }
});

/**
 * Process all JSX files in a directory
 */
function processBatch() {
  // Get the full path to the input directory
  const inputDirPath = path.resolve(process.cwd(), inputFile);

  // Verify it's a directory
  if (!fs.statSync(inputDirPath).isDirectory()) {
    console.error(`Error: ${inputDirPath} is not a directory. Use --batch with a directory path.`);
    process.exit(1);
  }

  // Get all JSX files in the directory
  const files = fs.readdirSync(inputDirPath).filter(file =>
    file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js')
  );

  console.log(`Found ${files.length} JSX/TSX/JS files to process.`);

  // Create output directory if it doesn't exist
  const outputDirPath = path.resolve(process.cwd(), options.outputDir);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  // Process each file
  let successes = 0;
  let failures = 0;

  files.forEach(file => {
    const inputFilePath = path.join(inputDirPath, file);
    const outputFilePath = path.join(outputDirPath, `${path.basename(file, path.extname(file))}_with_testids${path.extname(file)}`);

    try {
      processFileWithPaths(inputFilePath, outputFilePath);
      successes++;
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      failures++;
    }
  });

  console.log(`\nBatch processing complete: ${successes} files succeeded, ${failures} files failed.`);
}

/**
 * Process a single file
 */
function processFile() {
  // Format the prefix to ensure proper formatting (kebab-case with trailing dash if not empty)
  formatPrefix();

  // Get the full path to the input file
  const inputFilePath = path.resolve(process.cwd(), inputFile);

  // Create a filename with "_with_testids" suffix
  const fileExt = path.extname(inputFilePath);
  const fileName = path.basename(inputFilePath, fileExt);

  // Use the default output directory (locators_script/results) or user-specified one
  const outputDir = path.resolve(process.cwd(), options.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilePath = path.join(outputDir, `${fileName}_with_testids${fileExt}`);

  processFileWithPaths(inputFilePath, outputFilePath);
}

/**
 * Process a file with given input and output paths
 */
function processFileWithPaths(inputFilePath, outputFilePath) {
  // Read the input file
  let fileContent;
  try {
    fileContent = fs.readFileSync(inputFilePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    if (options.batch) {
      throw error; // Re-throw to be caught by batch processing
    } else {
      process.exit(1);
    }
  }

  // Format the prefix (if not already done in batch mode)
  if (!options.prefix.endsWith('-') && options.prefix) {
    formatPrefix();
  }

  // Find UI component imports (enhanced to detect more frameworks)
  const frameworks = detectUIFrameworks(fileContent);

  // Extract Chakra and custom component names
  const { chakraComponents, customComponents } = extractComponentNames(fileContent, frameworks);

  // Print detected components
  if (!options.batch || options.verbose) {
    console.log('Detected Chakra UI components:', Array.from(chakraComponents).join(', '));
    if (customComponents.size > 0) {
      console.log('Detected custom components:', Array.from(customComponents).join(', '));
    }
  }

  // If no components were found and we're not in HTML-only mode, use common Chakra components as fallback
  if (chakraComponents.size === 0 && !options.htmlOnly) {
    console.log('No Chakra UI imports found. Using default components list.');
    const defaultComponents = ['Box', 'Flex', 'VStack', 'HStack', 'Image', 'Text', 'Button', 'Container', 'Input', 'Heading', 'Grid', 'GridItem'];
    defaultComponents.forEach(comp => chakraComponents.add(comp));
  }

  // Common HTML elements to add testIds to (enhanced with more semantic elements)
  const htmlElements = getHtmlElements();

  if (!options.batch || options.verbose) {
    console.log('HTML elements that will receive test IDs:', Array.from(htmlElements).join(', '));
  }

  // Parse the JSX file with babel
  let ast;
  try {
    ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (error) {
    console.error(`Error parsing file: ${error.message}`);
    if (options.batch) {
      throw error; // Re-throw to be caught by batch processing
    } else {
      process.exit(1);
    }
  }

  // Initialize maps and trackers
  const {
    counters,
    testIdCache,
    testIdRegistry,
    commentMap,
    hierarchyMap,
    classNameMap,
    sxPropMap,
    loopMap,
    keyPropMap,
    keyExpressionMap,
    idPropMap,
    wrapperChildMap,
    roleMap,
    semanticGroupMap,
    interactiveElementMap,
    componentContextMap,
    pathMap,
    childTextMap,
    // New data structures for v10
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap
  } = initializeDataStructures();

  // First pass to gather context information
  gatherComponentContext(
    ast,
    commentMap,
    hierarchyMap,
    classNameMap,
    sxPropMap,
    loopMap,
    keyPropMap,
    keyExpressionMap,
    idPropMap,
    wrapperChildMap,
    roleMap,
    semanticGroupMap,
    interactiveElementMap,
    componentContextMap,
    pathMap,
    childTextMap,
    // New data structures for v10
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap,
    frameworks,
    options
  );

  // Process the AST and add data-testid attributes
  const { addedCount, componentTypesCount } = addTestIds(
    ast,
    chakraComponents,
    customComponents,
    htmlElements,
    options,
    counters,
    testIdCache,
    testIdRegistry,
    commentMap,
    hierarchyMap,
    classNameMap,
    sxPropMap,
    loopMap,
    keyPropMap,
    keyExpressionMap,
    idPropMap,
    wrapperChildMap,
    roleMap,
    semanticGroupMap,
    interactiveElementMap,
    componentContextMap,
    pathMap,
    childTextMap,
    // New data structures for v10
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap
  );

  // Generate the modified code
  const output = generate(ast, {
    retainLines: true,
    compact: false,
    jsescOption: {
      quotes: 'single',
    },
  }, fileContent);

  // Write the output
  try {
    fs.writeFileSync(outputFilePath, output.code, 'utf8');
    if (!options.batch || options.verbose) {
      console.log(`✅ Added ${addedCount} data-testid attributes`);
      console.log(`✅ Output written to: ${outputFilePath}`);

      // Print component types summary
      console.log('\nSummary of component types:');
      if (componentTypesCount.chakra > 0) {
        console.log(`  Chakra UI components: ${componentTypesCount.chakra}`);
      }
      if (componentTypesCount.custom > 0) {
        console.log(`  Custom components: ${componentTypesCount.custom}`);
      }
      if (componentTypesCount.html > 0) {
        console.log(`  HTML elements: ${componentTypesCount.html}`);
      }

      // Print type breakdown
      console.log('\nDetailed breakdown:');
      Object.keys(counters).sort().forEach(type => {
        console.log(`  ${type}: ${counters[type]}`);
      });

      console.log('\nExample test IDs:');
      const examples = Array.from(testIdRegistry).slice(0, 10);

      examples.forEach((id, i) => {
        console.log(`  ${i+1}. ${id}`);
      });

      if (testIdRegistry.size > 10) {
        console.log(`  ... and ${testIdRegistry.size - 10} more`);
      }
    } else {
      console.log(`✅ Processed ${path.basename(inputFilePath)} -> ${path.basename(outputFilePath)}`);
    }
  } catch (error) {
    console.error(`Error writing output: ${error.message}`);
    if (options.batch) {
      throw error;
    } else {
      process.exit(1);
    }
  }
}