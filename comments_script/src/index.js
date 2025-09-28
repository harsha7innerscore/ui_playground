#!/usr/bin/env node

/**
 * JSX Comments Insertion Script (v1)
 *
 * This script reads JSX files, analyzes their structure, and inserts
 * comments at appropriate positions.
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration for comment insertion
const CONFIG = {
  // Default output mode (modify original file or create new file)
  outputMode: 'new', // 'modify' or 'new'

  // Comment insertion rules
  rules: {
    // Component declaration comments
    componentDeclaration: true,

    // Props comments
    props: true,

    // State comments
    state: true,

    // Function comments
    functions: true,

    // JSX element comments
    jsxElements: true
  }
};

/**
 * Main function to process a JSX file
 *
 * @param {string} inputFilePath - Path to the input JSX file
 * @param {string} outputFilePath - Path to the output file (optional)
 * @param {Object} options - Configuration options
 * @returns {string} - The processed code
 */
function processJSXFile(inputFilePath, outputFilePath, options = {}) {
  // Merge options with defaults
  const config = { ...CONFIG, ...options };

  try {
    // Read the input file
    const code = fs.readFileSync(inputFilePath, 'utf-8');

    // Process the code
    const processedCode = processJSXCode(code, config);

    // Write the output
    if (config.outputMode === 'modify') {
      fs.writeFileSync(inputFilePath, processedCode);
      console.log(`Modified file: ${inputFilePath}`);
    } else {
      const outputPath = outputFilePath || inputFilePath.replace(/\.jsx?$/, '.commented.jsx');
      fs.writeFileSync(outputPath, processedCode);
      console.log(`Created new file: ${outputPath}`);
    }

    return processedCode;
  } catch (error) {
    console.error(`Error processing file ${inputFilePath}:`, error);
    throw error;
  }
}

/**
 * Process JSX code string
 *
 * @param {string} code - JSX code string
 * @param {Object} config - Configuration options
 * @returns {string} - The processed code
 */
function processJSXCode(code, config) {
  try {
    // Parse the code into an AST
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread']
    });

    // Traverse the AST and add comments
    traverseAndComment(ast, config);

    // Generate code from the modified AST
    const output = generate(ast, {
      retainLines: true,
      comments: true
    });

    return output.code;
  } catch (error) {
    console.error('Error processing JSX code:', error);
    throw error;
  }
}

/**
 * Traverse the AST and add comments
 *
 * @param {Object} ast - The AST to traverse
 * @param {Object} config - Configuration options
 */
function traverseAndComment(ast, config) {
  traverse(ast, {
    // Process component declarations
    ClassDeclaration(path) {
      if (config.rules.componentDeclaration) {
        addComponentComment(path);
      }
    },

    // Process function component declarations
    FunctionDeclaration(path) {
      if (isReactComponent(path) && config.rules.componentDeclaration) {
        addComponentComment(path);
      }

      if (config.rules.functions && !isReactComponent(path)) {
        addFunctionComment(path);
      }
    },

    // Process arrow function components
    VariableDeclarator(path) {
      if (t.isArrowFunctionExpression(path.node.init) &&
          isReactComponent(path) &&
          config.rules.componentDeclaration) {
        addComponentComment(path);
      }
    },

    // Process class properties (for state)
    ClassProperty(path) {
      if (path.node.key.name === 'state' && config.rules.state) {
        addStateComment(path);
      }
    },

    // Process methods
    ClassMethod(path) {
      if (path.node.kind === 'method' &&
          path.node.key.name !== 'render' &&
          config.rules.functions) {
        addMethodComment(path);
      }
    },

    // Process JSX elements
    JSXOpeningElement(path) {
      if (config.rules.jsxElements) {
        addJSXElementComment(path);
      }
    }
  });
}

/**
 * Check if a path represents a React component
 *
 * @param {Object} path - The AST path
 * @returns {boolean} - True if it's a React component
 */
function isReactComponent(path) {
  // Check for JSX return
  let hasJSX = false;

  if (t.isFunctionDeclaration(path.node)) {
    // For function declarations
    path.traverse({
      ReturnStatement(returnPath) {
        if (t.isJSXElement(returnPath.node.argument) ||
            t.isJSXFragment(returnPath.node.argument)) {
          hasJSX = true;
        }
      }
    });
  } else if (path.node.init && t.isArrowFunctionExpression(path.node.init)) {
    // For arrow functions
    const init = path.node.init;
    if (t.isJSXElement(init.body) || t.isJSXFragment(init.body)) {
      hasJSX = true;
    } else if (t.isBlockStatement(init.body)) {
      path.traverse({
        ReturnStatement(returnPath) {
          if (t.isJSXElement(returnPath.node.argument) ||
              t.isJSXFragment(returnPath.node.argument)) {
            hasJSX = true;
          }
        }
      });
    }
  }

  return hasJSX;
}

/**
 * Add a comment for a component
 *
 * @param {Object} path - The AST path
 */
function addComponentComment(path) {
  const componentName = path.node.id ? path.node.id.name : 'AnonymousComponent';
  const comment = ` Component: ${componentName}
 *
 * Description: This component handles the UI for ${componentName}
 *
 * Props:
 * - Add prop descriptions here
 `;

  addLeadingComment(path.node, comment);
}

/**
 * Add a comment for a function
 *
 * @param {Object} path - The AST path
 */
function addFunctionComment(path) {
  const functionName = path.node.id.name;
  const comment = ` Function: ${functionName}
 *
 * Description: This function handles...
 *
 * Parameters:
 * - Add parameter descriptions here
 *
 * Returns:
 * - Add return value description here
 `;

  addLeadingComment(path.node, comment);
}

/**
 * Add a comment for a class method
 *
 * @param {Object} path - The AST path
 */
function addMethodComment(path) {
  const methodName = path.node.key.name;
  const comment = ` Method: ${methodName}
 *
 * Description: This method handles...
 *
 * Parameters:
 * - Add parameter descriptions here
 *
 * Returns:
 * - Add return value description here
 `;

  addLeadingComment(path.node, comment);
}

/**
 * Add a comment for state
 *
 * @param {Object} path - The AST path
 */
function addStateComment(path) {
  const comment = ` Component State
 *
 * Description: This object contains the local state for this component
 *
 * State Properties:
 * - Add state property descriptions here
 `;

  addLeadingComment(path.node, comment);
}

/**
 * Add a comment for a JSX element
 *
 * @param {Object} path - The AST path
 */
function addJSXElementComment(path) {
  // Handle different node types for JSX elements
  let elementName;

  if (path.node.name && path.node.name.name) {
    elementName = path.node.name.name;
  } else if (path.node.name && path.node.name.type === 'JSXMemberExpression') {
    // Handle member expressions like Foo.Bar
    elementName = `${path.node.name.object.name}.${path.node.name.property.name}`;
  } else {
    // Skip if we can't determine the element name
    return;
  }

  // Skip common HTML elements
  const commonElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                         'button', 'input', 'form', 'a', 'ul', 'ol', 'li', 'table',
                         'tr', 'td', 'th', 'img', 'section', 'header', 'footer'];

  if (!commonElements.includes(elementName.toLowerCase())) {
    const comment = ` JSX Element: ${elementName}
 *
 * Purpose: This element represents...
`;

    addLeadingComment(path.node, comment);
  }
}

/**
 * Helper to add a leading comment
 *
 * @param {Object} node - The AST node
 * @param {string} comment - The comment text
 */
function addLeadingComment(node, comment) {
  if (!node.leadingComments) {
    node.leadingComments = [];
  }

  // Check if a similar comment already exists
  const commentExists = node.leadingComments.some(
    c => c.value.includes(comment.split('\n')[0])
  );

  if (!commentExists) {
    node.leadingComments.push({
      type: 'CommentBlock',
      value: comment
    });
  }
}

/**
 * Command line interface
 */
function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
JSX Comments Insertion Script (v1)

Usage:
  node index.js <input-file> [output-file] [--modify]

Options:
  --modify    Modify the original file instead of creating a new one

Examples:
  node index.js src/Component.jsx
  node index.js src/Component.jsx dist/Component.commented.jsx
  node index.js src/Component.jsx --modify
`);
    return;
  }

  const inputFile = args[0];
  let outputFile = null;
  let options = {};

  if (args.includes('--modify')) {
    options.outputMode = 'modify';
    args.splice(args.indexOf('--modify'), 1);
  }

  if (args.length > 1 && !args[1].startsWith('--')) {
    outputFile = args[1];
  }

  processJSXFile(inputFile, outputFile, options);
}

// If this file is executed directly, run the CLI
if (require.main === module) {
  cli();
}

// Export functions for testing and external use
module.exports = {
  processJSXFile,
  processJSXCode,
  CONFIG
};