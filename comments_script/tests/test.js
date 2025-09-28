/**
 * Test runner for JSX Comments Insertion Script
 */

const fs = require('fs');
const path = require('path');
const { processJSXCode } = require('../src/index');

// Directory for test files
const TEST_FILES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Tests to run
const tests = [
  {
    name: 'Class Component',
    inputFile: 'ClassComponent.jsx',
    expectedFile: 'ClassComponent.expected.jsx'
  },
  {
    name: 'Function Component',
    inputFile: 'FunctionComponent.jsx',
    expectedFile: 'FunctionComponent.expected.jsx'
  },
  {
    name: 'Arrow Function Component',
    inputFile: 'ArrowFunctionComponent.jsx',
    expectedFile: 'ArrowFunctionComponent.expected.jsx'
  }
];

// Run tests
function runTests() {
  console.log('Running tests for JSX Comments Insertion Script...\n');

  let passedCount = 0;

  for (const test of tests) {
    try {
      const inputPath = path.join(TEST_FILES_DIR, test.inputFile);
      const inputCode = fs.readFileSync(inputPath, 'utf-8');

      console.log(`Testing: ${test.name}...`);

      // Process the input code
      const processedCode = processJSXCode(inputCode, {});

      // Write the output for inspection
      const outputPath = path.join(OUTPUT_DIR, test.inputFile);
      fs.writeFileSync(outputPath, processedCode);

      console.log(`  Processed file saved to: ${outputPath}`);

      // Check if expected file exists, if yes compare results
      const expectedPath = path.join(TEST_FILES_DIR, test.expectedFile);
      if (fs.existsSync(expectedPath)) {
        const expectedCode = fs.readFileSync(expectedPath, 'utf-8');
        const matches = compareCode(processedCode, expectedCode);

        if (matches) {
          console.log('  ✅ Test PASSED: Output matches expected result');
          passedCount++;
        } else {
          console.log('  ❌ Test FAILED: Output does not match expected result');
        }
      } else {
        console.log('  ⚠️ No expected output file found. Manual verification required.');
      }
    } catch (error) {
      console.error(`  ❌ Test ERROR for ${test.name}:`, error);
    }

    console.log(''); // Add a blank line between tests
  }

  console.log(`Test Summary: ${passedCount}/${tests.length} tests passed`);
}

/**
 * Helper function to compare code, ignoring whitespace differences
 *
 * @param {string} actual - Actual code
 * @param {string} expected - Expected code
 * @returns {boolean} - True if they match, false otherwise
 */
function compareCode(actual, expected) {
  // Normalize whitespace for comparison
  const normalizeCode = code => code
    .replace(/\/\*\*[\s\S]*?\*\//g, '') // Remove all block comments
    .replace(/\/\/.*/g, '') // Remove all line comments
    .replace(/\s+/g, ' ') // Replace all whitespace sequences with a single space
    .trim(); // Trim leading/trailing whitespace

  return normalizeCode(actual) === normalizeCode(expected);
}

// Run the tests
runTests();