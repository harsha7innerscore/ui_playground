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
                console.log(`  ${i + 1}. ${id}`);
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

/**
 * Format the prefix to ensure proper formatting
 */
function formatPrefix() {
    if (options.prefix) {
        // Ensure the prefix is in kebab-case
        options.prefix = options.prefix
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/-$/g, '');

        // Add trailing dash if not present
        if (!options.prefix.endsWith('-')) {
            options.prefix += '-';
        }

        console.log(`Using user-specified prefix: "${options.prefix}" for all test IDs`);
    } else {
        console.log('No prefix specified, proceeding without a prefix');
    }
}

/**
 * Get the set of HTML elements to process
 */
function getHtmlElements() {
    return new Set([
        // Structure elements
        'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav',

        // Form elements
        'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
        'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter',

        // Table elements
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',

        // Media elements
        'img', 'video', 'audio', 'source', 'track', 'figure', 'figcaption',
        'canvas', 'picture', 'svg', 'map', 'area',

        // Interactive elements
        'a', 'dialog', 'details', 'summary', 'menu', 'menuitem',

        // Text formatting
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'blockquote', 'q', 'cite', 'pre', 'code', 'kbd', 'samp', 'var', 'mark',
        'bdi', 'bdo', 'ruby', 'rt', 'rp', 'abbr', 'address',

        // Semantic elements
        'time', 'data', 'slot', 'template', 'wbr', 'embed',
        'object', 'param', 'iframe', 'noscript', 'hr'
    ]);
}

/**
 * Initialize all data structures needed for processing
 */
function initializeDataStructures() {
    return {
        counters: {},  // Counters to generate unique test IDs
        testIdCache: new Map(), // Cache of generated IDs to maintain consistency
        testIdRegistry: new Set(), // Registry of all generated test IDs to ensure uniqueness
        commentMap: new Map(), // Map to store leading comments for nodes
        hierarchyMap: new Map(), // Map to store component hierarchy for context
        classNameMap: new Map(), // Map to store class names for components
        sxPropMap: new Map(), // Map to store sx prop values
        loopMap: new Map(), // Map to store loop info for components
        keyPropMap: new Map(), // Map to store key props for components
        keyExpressionMap: new Map(), // Map to store raw key expression for components
        idPropMap: new Map(), // Map to store id props for components
        wrapperChildMap: new Map(), // Map to store wrapper-child relationships
        roleMap: new Map(), // Map to store ARIA roles for components
        semanticGroupMap: new Map(), // Map to store semantic grouping for components
        interactiveElementMap: new Map(), // Map to identify interactive elements
        componentContextMap: new Map(), // Map to store rich context for each component
        pathMap: new Map(), // Map to store component path information
        childTextMap: new Map(), // Map to store text from child elements

        // New in v10: Enhanced data structures
        componentStateMap: new Map(), // Map to store component state info (loading, disabled, etc.)
        conditionalMap: new Map(), // Map to store conditional rendering patterns
        deepPropMap: new Map(), // Map to store deeply analyzed props
        logicalGroupMap: new Map(), // Map for logical component groups (forms, navigation, etc.)
        componentRoleMap: new Map() // Map for inferred component roles
    };
}

/**
 * Detect UI frameworks used in the file
 */
function detectUIFrameworks(fileContent) {
    const frameworks = {
        chakraUI: false,
        materialUI: false,
        antDesign: false,
        styledComponents: false,
        tailwindCSS: false,
        bootstrap: false,
        emotion: false,
        // New in v10: Additional frameworks
        nextUI: false,
        radixUI: false,
        headlessUI: false,
        shadcnUI: false,
        mantine: false
    };

    // Check for Chakra UI
    if (fileContent.includes('@chakra-ui/')) {
        frameworks.chakraUI = true;
    }

    // Check for Material UI
    if (fileContent.includes('@mui/') || fileContent.includes('@material-ui/')) {
        frameworks.materialUI = true;
    }

    // Check for Ant Design
    if (fileContent.includes('antd') || fileContent.includes('@ant-design/')) {
        frameworks.antDesign = true;
    }

    // Check for styled-components
    if (fileContent.includes('styled-components')) {
        frameworks.styledComponents = true;
    }

    // Check for Tailwind CSS
    if (fileContent.includes('tailwind') ||
        /className=["'].*?[^-](?:flex|grid|text-\w+)/.test(fileContent) ||
        /className=["'].*?(?:bg-|text-|border-|rounded-|shadow-|p-[0-9]|m-[0-9])/.test(fileContent)) {
        frameworks.tailwindCSS = true;
    }

    // Check for Bootstrap
    if (fileContent.includes('react-bootstrap') ||
        fileContent.includes('bootstrap') ||
        /className=["'].*?(?:container|row|col-|btn-|form-|card|navbar|modal)/.test(fileContent)) {
        frameworks.bootstrap = true;
    }

    // Check for Emotion
    if (fileContent.includes('@emotion/') || fileContent.includes('css`')) {
        frameworks.emotion = true;
    }

    // New in v10: Check for NextUI
    if (fileContent.includes('@nextui-org/') ||
        fileContent.includes('nextui') ||
        /import.*?from ["']@nextui/.test(fileContent)) {
        frameworks.nextUI = true;
    }

    // New in v10: Check for Radix UI
    if (fileContent.includes('@radix-ui/') ||
        /import.*?from ["']@radix/.test(fileContent)) {
        frameworks.radixUI = true;
    }

    // New in v10: Check for Headless UI
    if (fileContent.includes('@headlessui/') ||
        /import.*?from ["']@headlessui/.test(fileContent)) {
        frameworks.headlessUI = true;
    }

    // New in v10: Check for shadcn/ui
    if (fileContent.includes('@shadcn/ui') ||
        fileContent.includes('shadcn/ui') ||
        /import.*?from ["']@?shadcn/.test(fileContent)) {
        frameworks.shadcnUI = true;
    }

    // New in v10: Check for Mantine
    if (fileContent.includes('@mantine/') ||
        /import.*?from ["']@mantine/.test(fileContent)) {
        frameworks.mantine = true;
    }

    return frameworks;
}

/**
 * Extract component names from imports
 */
function extractComponentNames(fileContent, frameworks) {
    const chakraComponents = new Set();
    const customComponents = new Set();

    const importRegex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/g;
    const singleImportRegex = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g;
    const chakraImportRegex = /@chakra-ui\/\w+|@chakra-ui/g;
    const materialUIRegex = /@mui\/\w+|@material-ui/g;
    const antDesignRegex = /antd|@ant-design/g;

    // New in v10: Additional framework regexes
    const nextUIRegex = /@nextui-org\/\w+|nextui/g;
    const radixUIRegex = /@radix-ui\/\w+/g;
    const headlessUIRegex = /@headlessui\/\w+/g;
    const shadcnUIRegex = /@?shadcn\/ui/g;
    const mantineRegex = /@mantine\/\w+/g;

    // Handle named imports for various frameworks
    let match;
    while ((match = importRegex.exec(fileContent)) !== null) {
        const imports = match[1].split(',').map(s => s.trim());
        const packageName = match[2];

        // Check for Chakra UI
        if (packageName.match(chakraImportRegex)) {
            imports.forEach(importName => {
                // Handle 'as' imports: Button as ChakraButton
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                chakraComponents.add(finalName);
            });
        }
        // Check for Material UI
        else if (frameworks.materialUI && packageName.match(materialUIRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // Check for Ant Design
        else if (frameworks.antDesign && packageName.match(antDesignRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // New in v10: Check for NextUI
        else if (frameworks.nextUI && packageName.match(nextUIRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // New in v10: Check for Radix UI
        else if (frameworks.radixUI && packageName.match(radixUIRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // New in v10: Check for Headless UI
        else if (frameworks.headlessUI && packageName.match(headlessUIRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // New in v10: Check for shadcn/ui
        else if (frameworks.shadcnUI && packageName.match(shadcnUIRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // New in v10: Check for Mantine
        else if (frameworks.mantine && packageName.match(mantineRegex)) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                customComponents.add(finalName);
            });
        }
        // Check other imports for component-like names
        else if (imports.some(imp => isLikelyComponent(imp.split(' as ').pop().trim()))) {
            imports.forEach(importName => {
                const finalName = importName.includes(' as ')
                    ? importName.split(' as ')[1].trim()
                    : importName.trim();
                if (isLikelyComponent(finalName)) {
                    customComponents.add(finalName);
                }
            });
        }
    }

    // Handle default imports
    while ((match = singleImportRegex.exec(fileContent)) !== null) {
        const componentName = match[1];
        const packageName = match[2];

        if (packageName.match(chakraImportRegex)) {
            chakraComponents.add(componentName);
        } else if (frameworks.materialUI && packageName.match(materialUIRegex)) {
            customComponents.add(componentName);
        } else if (frameworks.antDesign && packageName.match(antDesignRegex)) {
            customComponents.add(componentName);
        }
        // New in v10: Additional framework checks for default imports
        else if (frameworks.nextUI && packageName.match(nextUIRegex)) {
            customComponents.add(componentName);
        }
        else if (frameworks.radixUI && packageName.match(radixUIRegex)) {
            customComponents.add(componentName);
        }
        else if (frameworks.headlessUI && packageName.match(headlessUIRegex)) {
            customComponents.add(componentName);
        }
        else if (frameworks.shadcnUI && packageName.match(shadcnUIRegex)) {
            customComponents.add(componentName);
        }
        else if (frameworks.mantine && packageName.match(mantineRegex)) {
            customComponents.add(componentName);
        }
        else if (isLikelyComponent(componentName)) {
            customComponents.add(componentName);
        }
    }

    // Also look for custom components that might be UI-based
    const customComponentRegex = /import\s+(\w+(?:Tool|Modal|Tooltip|Container|Button|Box|Card|Element|Header|Footer|Nav|Sidebar|Panel|List|Item|Icon|Badge|Tag|Tab|Section|Form|Input|Select|TextArea|Checkbox|Radio|Toggle|Slider|Switch|Menu|Dropdown|Dialog|Popover|Card|Avatar|Image|Video|Audio|Player|Wrapper))\s+from/g;
    while ((match = customComponentRegex.exec(fileContent)) !== null) {
        const componentName = match[1];
        if (!chakraComponents.has(componentName) && !customComponents.has(componentName)) {
            customComponents.add(componentName);
        }
    }

    // Extract custom components from imported files with similar file names
    const customComponentFileRegex = /import\s+(\w+)\s+from\s+["'].*\/([^/]+)\/\2["']/g;
    while ((match = customComponentFileRegex.exec(fileContent)) !== null) {
        const componentName = match[1];
        if (!chakraComponents.has(componentName) && !customComponents.has(componentName) && isLikelyComponent(componentName)) {
            customComponents.add(componentName);
        }
    }

    // Extract styled components
    if (frameworks.styledComponents || frameworks.emotion) {
        const styledComponentRegex = /(?:styled|css|sx)\s*\.\s*(\w+)|const\s+(\w+)\s*=\s*styled/g;
        while ((match = styledComponentRegex.exec(fileContent)) !== null) {
            const componentName = match[1] || match[2];
            if (componentName && !chakraComponents.has(componentName) && !customComponents.has(componentName) && isLikelyComponent(componentName)) {
                customComponents.add(componentName);
            }
        }
    }

    // New in v10: Extract hook-based custom components (for headless libraries)
    const hookBasedComponentRegex = /function\s+(\w+).*?\{\s*(?:const|let|var)\s+\w+\s*=\s*use(?:[\w]+)\(/g;
    while ((match = hookBasedComponentRegex.exec(fileContent)) !== null) {
        const componentName = match[1];
        if (componentName && !chakraComponents.has(componentName) && !customComponents.has(componentName) && isLikelyComponent(componentName)) {
            customComponents.add(componentName);
        }
    }

    return { chakraComponents, customComponents };
}

/**
 * Check if a name is likely a component name
 */
function isLikelyComponent(name) {
    // Check if name starts with uppercase letter (React component naming convention)
    if (!name || typeof name !== 'string') return false;

    if (name[0] !== name[0].toUpperCase()) return false;

    // Check for common component name patterns
    const componentPatterns = [
        // Standard components
        /Button$/, /Card$/, /Container$/, /Dialog$/, /Dropdown$/,
        /Form$/, /Grid$/, /Header$/, /Icon$/, /Input$/, /Item$/,
        /List$/, /Menu$/, /Modal$/, /Nav$/, /Panel$/, /Popover$/,
        /Section$/, /Select$/, /Sidebar$/, /Table$/, /Tabs$/,
        /Text$/, /Tooltip$/, /View$/, /Wrapper$/,

        // New in v10: Additional component patterns
        /Provider$/, /Context$/, /Component$/,
        /Avatar$/, /Badge$/, /Banner$/, /Calendar$/, /Chart$/,
        /Drawer$/, /Editor$/, /Field$/, /Layout$/, /Page$/,
        /Preview$/, /Progress$/, /Skeleton$/, /Spinner$/, /Toast$/,
        /^App/, /^Page/, /^Form/, /^Modal/, /^Dialog/, /^Card/,
        /^Nav/, /^Menu/, /^Tab/, /^List/, /^Item/, /^Button/
    ];

    return componentPatterns.some(pattern => pattern.test(name));
}

/**
 * First pass to gather component context information
 */
function gatherComponentContext(
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
    // New v10 data structures
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap,
    frameworks,
    options
) {
    // First build a path map for each element
    let currentPath = [];

    // First pass: Build path map and detect control flow patterns
    traverse(ast, {
        enter(path) {
            if (path.isJSXElement()) {
                const elementName = getElementName(path.node);
                if (elementName) {
                    currentPath.push(elementName);
                    // Store the current path for this node
                    pathMap.set(path.node, [...currentPath]);
                }
            }

            // New in v10: Detect conditional rendering patterns
            if (options.conditionAware) {
                detectConditionalRendering(path, conditionalMap);
            }
        },
        exit(path) {
            if (path.isJSXElement()) {
                const elementName = getElementName(path.node);
                if (elementName) {
                    currentPath.pop();
                }
            }
        }
    });

    // Second pass: Collect component attributes, state, and role info
    traverse(ast, {
        enter(path) {
            // Collect leading comments
            const comments = path.node.leadingComments || [];
            if (comments.length > 0) {
                // Extract comment text
                const commentText = comments.map(comment => comment.value.trim()).join(' ');
                commentMap.set(path.node, commentText);
            }

            // Track loops and mapping components
            if (path.isCallExpression() &&
                (path.get('callee').isMemberExpression() || path.get('callee').isIdentifier()) &&
                ((path.node.callee.name === 'map') ||
                    (path.node.callee.property && path.node.callee.property.name === 'map'))) {
                // Store information about the loop context
                const loopPath = path.findParent(p => p.isJSXElement() || p.isJSXExpressionContainer());
                if (loopPath) {
                    // Get array being mapped, if possible
                    let arrayName = '';
                    try {
                        if (path.node.callee.object && path.node.callee.object.name) {
                            arrayName = path.node.callee.object.name;
                        } else if (path.node.callee.object && path.node.callee.object.property) {
                            arrayName = path.node.callee.object.property.name;
                        }
                    } catch (e) {
                        // Unable to extract
                    }

                    loopMap.set(loopPath.node, {
                        isLoop: true,
                        loopVarName: path.node.arguments[0] &&
                            path.node.arguments[0].params &&
                            path.node.arguments[0].params[0] ?
                            path.node.arguments[0].params[0].name : 'item',
                        arrayName
                    });
                }
            }

            // If this is a JSX element, record various attributes and relationships
            if (path.isJSXElement()) {
                extractElementAttributes(
                    path,
                    classNameMap,
                    sxPropMap,
                    keyPropMap,
                    keyExpressionMap,
                    idPropMap,
                    roleMap,
                    // New in v10: Additional maps
                    componentStateMap,
                    deepPropMap,
                    frameworks,
                    options
                );

                recordElementRelationships(
                    path,
                    hierarchyMap,
                    wrapperChildMap,
                    semanticGroupMap,
                    // New in v10: Additional maps
                    logicalGroupMap
                );

                identifyInteractiveElements(path, interactiveElementMap);

                // New in v10: Infer component roles
                if (options.roleInference) {
                    inferComponentRole(path, componentRoleMap, frameworks);
                }

                // Extract text from child elements for better context
                if (options.useChildText) {
                    const elementText = getTextFromJSXElement(path.node, true);
                    if (elementText) {
                        childTextMap.set(path.node, elementText);
                    }
                }
            }
        }
    });

    // Third pass: Build component context based on gathered information
    traverse(ast, {
        JSXElement(path) {
            buildComponentContext(
                path,
                hierarchyMap,
                classNameMap,
                sxPropMap,
                commentMap,
                roleMap,
                semanticGroupMap,
                interactiveElementMap,
                componentContextMap,
                pathMap,
                childTextMap,
                // New v10 data structures
                componentStateMap,
                conditionalMap,
                deepPropMap,
                logicalGroupMap,
                componentRoleMap,
                frameworks,
                options
            );
        }
    });

    // New in v10: Final pass to identify logical groups of components
    if (options.groupDetection) {
        identifyLogicalGroups(ast, logicalGroupMap, hierarchyMap, componentContextMap);
    }
}

/**
 * Get element name from JSXElement node
 */
function getElementName(node) {
    if (!node || !node.openingElement || !node.openingElement.name) {
        return null;
    }

    if (t.isJSXIdentifier(node.openingElement.name)) {
        return node.openingElement.name.name;
    } else if (t.isJSXMemberExpression(node.openingElement.name)) {
        return node.openingElement.name.property.name;
    }

    return null;
}

/**
 * New in v10: Detect conditional rendering patterns
 */
function detectConditionalRendering(path, conditionalMap) {
    // Check for ternary expressions in JSX
    if (path.isConditionalExpression() &&
        (path.parent.type === 'JSXExpressionContainer' ||
            path.findParent(p => p.isJSXElement()))) {

        let conditionType = 'unknown';
        let conditionVar = '';

        // Extract condition variable and type
        const condition = path.node.test;
        if (t.isIdentifier(condition)) {
            conditionVar = condition.name;
            conditionType = getConditionTypeFromName(conditionVar);
        } else if (t.isMemberExpression(condition)) {
            try {
                conditionVar = condition.property.name;
                conditionType = getConditionTypeFromName(conditionVar);
            } catch (e) {
                // Unable to extract
            }
        } else if (t.isBinaryExpression(condition)) {
            try {
                if (t.isIdentifier(condition.left)) {
                    conditionVar = condition.left.name;
                    conditionType = getConditionTypeFromName(conditionVar);
                } else if (t.isMemberExpression(condition.left)) {
                    conditionVar = condition.left.property.name;
                    conditionType = getConditionTypeFromName(conditionVar);
                }
            } catch (e) {
                // Unable to extract
            }
        }

        // Find the JSX elements in the consequent and alternate branches
        const consequent = path.get('consequent');
        const alternate = path.get('alternate');

        if (consequent.isJSXElement()) {
            conditionalMap.set(consequent.node, {
                type: conditionType,
                variable: conditionVar,
                branch: 'consequent',
                condition: generateConditionString(condition)
            });
        }

        if (alternate.isJSXElement()) {
            conditionalMap.set(alternate.node, {
                type: conditionType,
                variable: conditionVar,
                branch: 'alternate',
                condition: generateConditionString(condition)
            });
        }
    }

    // Check for logical expressions (&& operator) in JSX
    if (path.isLogicalExpression() && path.node.operator === '&&' &&
        (path.parent.type === 'JSXExpressionContainer' ||
            path.findParent(p => p.isJSXElement()))) {

        let conditionType = 'unknown';
        let conditionVar = '';

        // Extract condition variable and type
        const condition = path.node.left;
        if (t.isIdentifier(condition)) {
            conditionVar = condition.name;
            conditionType = getConditionTypeFromName(conditionVar);
        } else if (t.isMemberExpression(condition)) {
            try {
                conditionVar = condition.property.name;
                conditionType = getConditionTypeFromName(conditionVar);
            } catch (e) {
                // Unable to extract
            }
        }

        // Find the JSX element in the right side
        const right = path.get('right');
        if (right.isJSXElement()) {
            conditionalMap.set(right.node, {
                type: conditionType,
                variable: conditionVar,
                branch: 'conditional',
                condition: generateConditionString(condition)
            });
        }
    }
}

/**
 * New in v10: Infer condition type from variable name
 */
function getConditionTypeFromName(name) {
    if (!name) return 'unknown';

    name = name.toLowerCase();

    if (name.includes('loading') || name.includes('progress') || name.includes('pending')) {
        return 'loading';
    } else if (name.includes('error') || name.includes('failed') || name.includes('exception')) {
        return 'error';
    } else if (name.includes('success') || name.includes('completed') || name.includes('done')) {
        return 'success';
    } else if (name.includes('empty') || name.includes('no') || name.includes('zero') || name.includes('null')) {
        return 'empty';
    } else if (name.includes('is') || name.includes('has') || name.includes('should') || name.includes('can')) {
        return 'boolean';
    } else if (name.includes('show') || name.includes('display') || name.includes('visible') || name.includes('open')) {
        return 'visibility';
    } else if (name.includes('enabled') || name.includes('disabled') || name.includes('active')) {
        return 'state';
    }

    return 'unknown';
}

/**
 * New in v10: Generate a string representation of the condition
 */
function generateConditionString(condition) {
    if (t.isIdentifier(condition)) {
        return condition.name;
    } else if (t.isMemberExpression(condition)) {
        try {
            const object = condition.object.name || 'obj';
            const property = condition.property.name || 'prop';
            return `${object}.${property}`;
        } catch (e) {
            return 'unknown.condition';
        }
    } else if (t.isBinaryExpression(condition)) {
        try {
            const left = t.isIdentifier(condition.left) ? condition.left.name :
                (t.isMemberExpression(condition.left) ? `${condition.left.object.name}.${condition.left.property.name}` : '?');
            const right = t.isLiteral(condition.right) ? condition.right.value : '?';
            return `${left} ${condition.operator} ${right}`;
        } catch (e) {
            return 'binary.condition';
        }
    }

    return 'condition';
}

/**
 * New in v10: Infer the semantic role of a component
 */
function inferComponentRole(path, componentRoleMap, frameworks) {
    const node = path.node;
    let role = '';

    // Check element name first
    const elementName = getElementName(node);
    if (!elementName) return;

    const elementNameLower = elementName.toLowerCase();

    // Check semantic HTML elements
    if (elementNameLower === 'button' || elementName === 'Button') {
        role = 'button';
    } else if (elementNameLower === 'a' || elementNameLower === 'link' || elementName === 'Link') {
        role = 'link';
    } else if (elementNameLower === 'input') {
        // Check input type
        const typeAttr = node.openingElement.attributes.find(
            attr => t.isJSXAttribute(attr) && attr.name.name === 'type'
        );
        if (typeAttr && t.isStringLiteral(typeAttr.value)) {
            role = `input-${typeAttr.value.value}`;
        } else {
            role = 'input';
        }
    } else if (/^h[1-6]$/.test(elementNameLower) || elementName === 'Heading') {
        role = 'heading';
    } else if (elementNameLower === 'img' || elementName === 'Image') {
        role = 'image';
    } else if (elementNameLower === 'nav' || elementName === 'Navigation') {
        role = 'navigation';
    } else if (elementNameLower === 'form' || elementName === 'Form') {
        role = 'form';
    }

    // Check for component name patterns
    if (!role) {
        if (/Button$/.test(elementName)) {
            role = 'button';
        } else if (/Nav(igation)?$/.test(elementName) || /Menu/.test(elementName)) {
            role = 'navigation';
        } else if (/Form$/.test(elementName)) {
            role = 'form';
        } else if (/Input$/.test(elementName) || /Field$/.test(elementName)) {
            role = 'input';
        } else if (/Card$/.test(elementName)) {
            role = 'card';
        } else if (/Table$/.test(elementName) || /Grid$/.test(elementName)) {
            role = 'table';
        } else if (/List$/.test(elementName)) {
            role = 'list';
        } else if (/Item$/.test(elementName)) {
            role = 'item';
        } else if (/Container$/.test(elementName) || /Wrapper$/.test(elementName)) {
            role = 'container';
        } else if (/Header$/.test(elementName)) {
            role = 'header';
        } else if (/Footer$/.test(elementName)) {
            role = 'footer';
        } else if (/Modal$/.test(elementName) || /Dialog$/.test(elementName)) {
            role = 'dialog';
        } else if (/Drawer$/.test(elementName)) {
            role = 'drawer';
        }
    }

    // Check for framework-specific patterns
    if (!role && frameworks) {
        if (frameworks.chakraUI) {
            if (elementName === 'Box' || elementName === 'Flex' || elementName === 'Stack' ||
                elementName === 'HStack' || elementName === 'VStack') {
                role = 'container';
            } else if (elementName === 'Text') {
                role = 'text';
            } else if (elementName === 'Icon') {
                role = 'icon';
            } else if (elementName === 'Avatar') {
                role = 'avatar';
            }
        } else if (frameworks.materialUI) {
            if (elementName === 'Paper' || elementName === 'Box' || elementName === 'Container') {
                role = 'container';
            } else if (elementName === 'Typography') {
                role = 'text';
            } else if (elementName === 'Icon' || elementName.endsWith('Icon')) {
                role = 'icon';
            }
        }
    }

    if (role) {
        componentRoleMap.set(node, role);
    }
}

/**
 * New in v10: Identify logical groups of components based on their relationships
 */
function identifyLogicalGroups(ast, logicalGroupMap, hierarchyMap, componentContextMap) {
    // The groups we want to identify
    const groupTypes = {
        FORM: 'form',
        NAVIGATION: 'navigation',
        LIST: 'list',
        TABLE: 'table',
        CARD: 'card',
        SEARCH: 'search',
        AUTH: 'authentication',
        DIALOG: 'dialog',
        PAGINATION: 'pagination',
        LAYOUT: 'layout',
        HEADER: 'header',
        FOOTER: 'footer'
    };

    // Traverse and identify logical groups
    traverse(ast, {
        JSXElement(path) {
            const node = path.node;
            const context = componentContextMap.get(node);

            if (!context) return;

            // Check for form groups
            if (context.name === 'form' || context.name === 'Form' ||
                context.parentName === 'form' || context.parentName === 'Form' ||
                context.name.includes('Form') ||
                (context.comments &&
                    /\b(form|signup|login|register|submit|input)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.FORM,
                    role: context.parentName === 'form' || context.parentName === 'Form' ? 'field' : 'form'
                });
            }

            // Check for navigation groups
            else if (context.name === 'nav' || context.name === 'Nav' ||
                context.name.includes('Nav') || context.name.includes('Menu') ||
                context.parentName === 'nav' || context.parentName === 'Nav' ||
                context.parentName.includes('Nav') || context.parentName.includes('Menu') ||
                (context.comments &&
                    /\b(navigation|navbar|menu|header|tabs|breadcrumb)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.NAVIGATION,
                    role: context.parentName === 'nav' || context.parentName === 'Nav' ||
                        context.parentName.includes('Nav') ? 'item' : 'container'
                });
            }

            // Check for list groups
            else if (context.name === 'ul' || context.name === 'ol' || context.name === 'li' ||
                context.name.includes('List') || context.parentName.includes('List') ||
                (context.comments &&
                    /\b(list|items|results|collection)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.LIST,
                    role: context.name === 'li' || context.name.includes('Item') ? 'item' : 'list'
                });
            }

            // Check for table groups
            else if (context.name === 'table' || context.name === 'tr' ||
                context.name === 'td' || context.name === 'th' ||
                context.name.includes('Table') || context.name.includes('Grid') ||
                context.parentName.includes('Table') || context.parentName.includes('Grid') ||
                (context.comments &&
                    /\b(table|grid|data|row|column)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.TABLE,
                    role: context.name === 'tr' || context.name === 'Row' ? 'row' :
                        context.name === 'td' || context.name === 'th' || context.name === 'Cell' ? 'cell' : 'table'
                });
            }

            // Check for card groups
            else if (context.name.includes('Card') || context.parentName.includes('Card') ||
                (context.comments &&
                    /\b(card|panel|tile)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.CARD,
                    role: context.parentName.includes('Card') ? 'content' : 'card'
                });
            }

            // Check for search components
            else if (context.name.includes('Search') || context.parentName.includes('Search') ||
                (context.comments &&
                    /\b(search|filter|find)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.SEARCH,
                    role: context.name.includes('Input') ? 'input' : 'container'
                });
            }

            // Check for auth components
            else if ((context.comments &&
                /\b(login|register|signup|auth|password|username|email|credentials)\b/i.test(context.comments)) ||
                context.name.includes('Login') || context.name.includes('Register') ||
                context.name.includes('Auth') || context.name.includes('Password')) {
                logicalGroupMap.set(node, {
                    type: groupTypes.AUTH,
                    role: context.name.includes('Form') ? 'form' :
                        context.name.includes('Button') ? 'button' : 'container'
                });
            }

            // Check for dialog components
            else if (context.name.includes('Dialog') || context.name.includes('Modal') ||
                context.parentName.includes('Dialog') || context.parentName.includes('Modal') ||
                (context.comments &&
                    /\b(dialog|modal|popup|overlay)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.DIALOG,
                    role: context.name.includes('Header') ? 'header' :
                        context.name.includes('Footer') ? 'footer' :
                            context.name.includes('Body') || context.name.includes('Content') ? 'content' : 'container'
                });
            }

            // Check for pagination components
            else if (context.name.includes('Pagination') || context.parentName.includes('Pagination') ||
                (context.comments &&
                    /\b(pagination|pager|page\s+nav)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.PAGINATION,
                    role: context.name.includes('Item') || context.name.includes('Button') ? 'item' : 'container'
                });
            }

            // Check for layout components
            else if (context.name.includes('Layout') || context.name.includes('Container') ||
                context.name === 'Box' || context.name === 'Flex' || context.name.includes('Stack') ||
                (context.comments &&
                    /\b(layout|container|wrapper|section|area|region)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.LAYOUT,
                    role: 'container'
                });
            }

            // Check for header components
            else if (context.name === 'header' || context.name.includes('Header') ||
                (context.comments &&
                    /\b(header|app\s+bar|title\s+bar|top\s+bar)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.HEADER,
                    role: 'header'
                });
            }

            // Check for footer components
            else if (context.name === 'footer' || context.name.includes('Footer') ||
                (context.comments &&
                    /\b(footer|bottom\s+bar)\b/i.test(context.comments))) {
                logicalGroupMap.set(node, {
                    type: groupTypes.FOOTER,
                    role: 'footer'
                });
            }
        }
    });
}

/**
 * Extract various attributes from a JSX element
 */
function extractElementAttributes(
    path,
    classNameMap,
    sxPropMap,
    keyPropMap,
    keyExpressionMap,
    idPropMap,
    roleMap,
    // New in v10: Additional maps
    componentStateMap,
    deepPropMap,
    frameworks,
    options
) {
    const node = path.node;
    const openingElement = node.openingElement;

    if (openingElement && openingElement.attributes) {
        // Extract className
        if (options.classBased) {
            extractClassName(node, openingElement.attributes, classNameMap, frameworks);
        }

        // Extract sx prop
        if (options.sxBased) {
            extractSxProp(node, openingElement.attributes, sxPropMap, frameworks);
        }

        // Extract key prop
        extractKeyProp(node, openingElement.attributes, keyPropMap, keyExpressionMap);

        // Extract id prop
        extractIdProp(node, openingElement.attributes, idPropMap);

        // Extract ARIA role
        extractRole(node, openingElement.attributes, roleMap);

        // New in v10: Extract component state information
        if (options.stateAware) {
            extractComponentState(node, openingElement.attributes, componentStateMap);
        }

        // New in v10: Extract deep prop analysis
        if (options.deepProps) {
            extractDeepProps(node, openingElement.attributes, deepPropMap);
        }
    }
}

/**
 * New in v10: Extract component state information (loading, disabled, active, etc.)
 */
function extractComponentState(node, attributes, componentStateMap) {
    const stateAttributes = [
        // Boolean state props
        { name: 'disabled', state: 'disabled' },
        { name: 'readOnly', state: 'readonly' },
        { name: 'checked', state: 'checked' },
        { name: 'selected', state: 'selected' },
        { name: 'active', state: 'active' },
        { name: 'expanded', state: 'expanded' },
        { name: 'collapsed', state: 'collapsed' },
        { name: 'hidden', state: 'hidden' },
        { name: 'required', state: 'required' },
        { name: 'open', state: 'open' },
        { name: 'closed', state: 'closed' },
        { name: 'highlighted', state: 'highlighted' },

        // Loading states
        { name: 'isLoading', state: 'loading' },
        { name: 'loading', state: 'loading' },
        { name: 'isFetching', state: 'loading' },
        { name: 'isPending', state: 'loading' },

        // Error states
        { name: 'isError', state: 'error' },
        { name: 'error', state: 'error' },
        { name: 'hasError', state: 'error' },
        { name: 'invalid', state: 'error' },
        { name: 'isInvalid', state: 'error' },

        // Success states
        { name: 'isSuccess', state: 'success' },
        { name: 'success', state: 'success' },
        { name: 'isValid', state: 'success' },
        { name: 'valid', state: 'success' },
        { name: 'completed', state: 'success' },

        // Other states
        { name: 'variant', state: 'variant' },
        { name: 'size', state: 'size' },
        { name: 'color', state: 'color' },
        { name: 'colorScheme', state: 'color' },
        { name: 'status', state: 'status' }
    ];

    const states = {};

    // Check for each state attribute
    for (const stateAttr of stateAttributes) {
        const attr = attributes.find(
            attr => t.isJSXAttribute(attr) && attr.name.name === stateAttr.name
        );

        if (attr) {
            if (!attr.value) {
                // Boolean attribute without value (e.g., <Button disabled />)
                states[stateAttr.state] = true;
            } else if (t.isStringLiteral(attr.value)) {
                // String literal value (e.g., <Button variant="outline" />)
                states[stateAttr.state] = attr.value.value;
            } else if (t.isJSXExpressionContainer(attr.value)) {
                // Expression value
                const expr = attr.value.expression;
                if (t.isBooleanLiteral(expr)) {
                    states[stateAttr.state] = expr.value;
                } else if (t.isStringLiteral(expr)) {
                    states[stateAttr.state] = expr.value;
                } else if (t.isIdentifier(expr)) {
                    states[stateAttr.state] = expr.name;
                } else if (t.isMemberExpression(expr)) {
                    try {
                        const property = expr.property.name;
                        states[stateAttr.state] = property;
                    } catch (e) {
                        // Unable to extract
                    }
                }
            }
        }
    }

    // Only set state map if we found state information
    if (Object.keys(states).length > 0) {
        componentStateMap.set(node, states);
    }
}

/**
 * New in v10: Extract deep prop analysis
 */
function extractDeepProps(node, attributes, deepPropMap) {
    const semanticProps = {};

    // Analyze all attributes
    for (const attr of attributes) {
        if (!t.isJSXAttribute(attr)) continue;

        const name = attr.name.name;

        // Skip data-testid and internal React props
        if (name === 'data-testid' || name === 'key' || name === 'ref') continue;

        // Extract value based on type
        let value = null;

        if (!attr.value) {
            // Boolean attribute
            value = true;
        } else if (t.isStringLiteral(attr.value)) {
            value = attr.value.value;
        } else if (t.isJSXExpressionContainer(attr.value)) {
            const expr = attr.value.expression;
            if (t.isBooleanLiteral(expr)) {
                value = expr.value;
            } else if (t.isStringLiteral(expr)) {
                value = expr.value;
            } else if (t.isNumericLiteral(expr)) {
                value = expr.value;
            } else if (t.isIdentifier(expr)) {
                value = expr.name;
            } else if (t.isMemberExpression(expr)) {
                try {
                    const property = expr.property.name;
                    const object = expr.object.name || '';
                    value = `${object}.${property}`;
                } catch (e) {
                    // Unable to extract
                    value = 'expression';
                }
            } else if (t.isObjectExpression(expr)) {
                value = 'object';
            } else if (t.isArrayExpression(expr)) {
                value = 'array';
            } else if (t.isFunctionExpression(expr) || t.isArrowFunctionExpression(expr)) {
                value = 'function';
            } else {
                value = 'expression';
            }
        }

        if (value !== null) {
            semanticProps[name] = value;
        }
    }

    // Only set map if we found properties
    if (Object.keys(semanticProps).length > 0) {
        deepPropMap.set(node, semanticProps);
    }
}

/**
 * Extract className attribute from element
 */
function extractClassName(node, attributes, classNameMap, frameworks) {
    const classNameAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'className'
    );

    if (classNameAttr) {
        let className = '';
        if (t.isStringLiteral(classNameAttr.value)) {
            className = classNameAttr.value.value;
        } else if (t.isJSXExpressionContainer(classNameAttr.value) &&
            classNameAttr.value.expression) {
            // Handle different types of className expressions
            if (t.isMemberExpression(classNameAttr.value.expression)) {
                try {
                    className = classNameAttr.value.expression.property.name;
                } catch (e) {
                    // Unable to extract
                }
            } else if (t.isCallExpression(classNameAttr.value.expression) &&
                (classNameAttr.value.expression.callee.name === 'clsx' ||
                    classNameAttr.value.expression.callee.name === 'classNames' ||
                    classNameAttr.value.expression.callee.name === 'cx')) {
                // Handle clsx, classNames, or cx
                try {
                    const args = classNameAttr.value.expression.arguments;
                    // Extract strings from arguments
                    const classNames = [];
                    args.forEach(arg => {
                        if (t.isStringLiteral(arg)) {
                            classNames.push(arg.value);
                        } else if (t.isObjectExpression(arg)) {
                            // Handle {className: true} pattern
                            arg.properties.forEach(prop => {
                                if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                                    classNames.push(prop.key.name);
                                }
                            });
                        }
                    });
                    className = classNames.join(' ');
                } catch (e) {
                    // Unable to extract
                }
            } else if (t.isTemplateLiteral(classNameAttr.value.expression)) {
                // Handle template literals
                try {
                    const quasis = classNameAttr.value.expression.quasis.map(q => q.value.raw);
                    className = quasis.join(' ').trim();
                } catch (e) {
                    // Unable to extract
                }
            } else if (t.isConditionalExpression(classNameAttr.value.expression)) {
                // Handle ternary expressions: className={isActive ? 'active' : 'inactive'}
                try {
                    const consequent = classNameAttr.value.expression.consequent;
                    const alternate = classNameAttr.value.expression.alternate;

                    if (t.isStringLiteral(consequent)) {
                        className = consequent.value;
                    }
                    if (t.isStringLiteral(alternate) && !className) {
                        className = alternate.value;
                    }
                } catch (e) {
                    // Unable to extract
                }
            }
        }

        if (className) {
            // Detect and annotate framework-specific classes
            let enhancedClassName = className;

            // Add framework information if detected
            if (frameworks.tailwindCSS && isTailwindClass(className)) {
                enhancedClassName = `tailwind:${className}`;
            } else if (frameworks.bootstrap && isBootstrapClass(className)) {
                enhancedClassName = `bootstrap:${className}`;
            }

            classNameMap.set(node, enhancedClassName);
        }
    }
}
/**
 * Extract text from a JSX element node
 */
function getTextFromJSXElement(node, processChildren = false) {
    if (!node || !node.children) return '';

    let textContent = '';

    for (const child of node.children) {
        // Direct text node
        if (t.isJSXText(child)) {
            const text = child.value.trim();
            if (text) {
                textContent += text + ' ';
            }
        }
        // Expression container with a string literal
        else if (t.isJSXExpressionContainer(child) &&
            t.isStringLiteral(child.expression)) {
            textContent += child.expression.value + ' ';
        }
        // Expression container with a template literal
        else if (t.isJSXExpressionContainer(child) &&
            t.isTemplateLiteral(child.expression)) {
            try {
                const quasis = child.expression.quasis.map(q => q.value.raw.trim()).join(' ');
                if (quasis) {
                    textContent += quasis + ' ';
                }
            } catch (e) {
                // Unable to extract
            }
        }
        // JSX Element with a known text-like component
        else if (t.isJSXElement(child)) {
            const elementName = child.openingElement && child.openingElement.name
                ? (t.isJSXIdentifier(child.openingElement.name) ? child.openingElement.name.name : null)
                : null;

            // Extract from text-like elements
            const textLikeElements = ['span', 'p', 'b', 'i', 'em', 'strong', 'u', 'small', 'mark', 'del', 'ins', 'sub', 'sup'];

            if (elementName && (
                elementName === 'Text' ||
                textLikeElements.includes(elementName.toLowerCase()) ||
                processChildren
            )) {
                const nestedText = getTextFromJSXElement(child);
                if (nestedText) {
                    textContent += nestedText + ' ';
                }
            }
        }
    }

    // Clean up text
    return textContent.trim()
        .replace(/\s+/g, ' ')
        .substring(0, 50); // limit length
}

/**
 * Identify interactive elements
 */
function identifyInteractiveElements(path, interactiveElementMap) {
    if (!path.isJSXElement()) return;

    const node = path.node;
    const elementName = getElementName(node);

    if (!elementName) return;

    // Known interactive elements
    const interactiveElements = [
        'button', 'a', 'input', 'select', 'textarea', 'label',
        'dialog', 'summary', 'details'
    ];

    // Common component names that are likely interactive
    const interactiveComponents = [
        'Button', 'Link', 'IconButton', 'Checkbox', 'Radio',
        'Switch', 'Slider', 'Menu', 'MenuItem', 'Dropdown',
        'Select', 'Input', 'Textarea', 'Form', 'Dialog',
        'Modal', 'Accordion', 'Tabs', 'Tab'
    ];

    // Check element name
    if (interactiveElements.includes(elementName.toLowerCase()) ||
        interactiveComponents.includes(elementName)) {
        interactiveElementMap.set(node, {
            isInteractive: true,
            type: elementName.toLowerCase()
        });
        return;
    }

    // Check for interactive attributes
    if (node.openingElement && node.openingElement.attributes) {
        const interactiveAttributes = [
            'onClick', 'onChange', 'onInput', 'onSubmit', 'onKeyPress',
            'onKeyDown', 'onKeyUp', 'onFocus', 'onBlur', 'onMouseDown',
            'onMouseUp', 'onMouseOver', 'onMouseOut', 'onDrag',
            'onDrop', 'onTouchStart', 'onTouchEnd'
        ];

        for (const attr of node.openingElement.attributes) {
            if (t.isJSXAttribute(attr) &&
                interactiveAttributes.includes(attr.name.name)) {
                interactiveElementMap.set(node, {
                    isInteractive: true,
                    interactionType: attr.name.name,
                    type: elementName.toLowerCase()
                });
                return;
            }
        }
    }
}

/**
 * Build comprehensive component context
 */
function buildComponentContext(
    path,
    hierarchyMap,
    classNameMap,
    sxPropMap,
    commentMap,
    roleMap,
    semanticGroupMap,
    interactiveElementMap,
    componentContextMap,
    pathMap,
    childTextMap,
    // New v10 data structures
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap,
    frameworks,
    options
) {
    const node = path.node;
    if (!node || !node.openingElement) return;

    const context = {
        name: '',
        parentName: '',
        className: '',
        sxProps: {},
        comments: '',
        role: '',
        groupType: '',
        isInteractive: false,
        text: '',
        path: [],
        state: {},
        conditional: null,
        deepProps: {},
        logicalGroup: null,
        semanticRole: ''
    };

    // Get element name
    if (t.isJSXIdentifier(node.openingElement.name)) {
        context.name = node.openingElement.name.name;
    } else if (t.isJSXMemberExpression(node.openingElement.name)) {
        context.name = node.openingElement.name.property.name;
    }

    // Get parent name
    const parentNode = hierarchyMap.get(node);
    if (parentNode && parentNode.openingElement) {
        if (t.isJSXIdentifier(parentNode.openingElement.name)) {
            context.parentName = parentNode.openingElement.name.name;
        } else if (t.isJSXMemberExpression(parentNode.openingElement.name)) {
            context.parentName = parentNode.openingElement.name.property.name;
        }
    }

    // Get class name
    if (classNameMap.has(node)) {
        context.className = classNameMap.get(node);
    }

    // Get sx props
    if (sxPropMap.has(node)) {
        context.sxProps = sxPropMap.get(node);
    }

    // Get comments
    if (commentMap.has(node)) {
        context.comments = commentMap.get(node);
    }

    // Get ARIA role
    if (roleMap.has(node)) {
        context.role = roleMap.get(node);
    }

    // Get semantic group
    if (semanticGroupMap.has(node)) {
        context.groupType = semanticGroupMap.get(node).type;
    }

    // Check if interactive
    if (interactiveElementMap.has(node)) {
        context.isInteractive = interactiveElementMap.get(node).isInteractive;
    }

    // Get text content
    if (childTextMap.has(node)) {
        context.text = childTextMap.get(node);
    }

    // Get component path
    if (pathMap.has(node)) {
        context.path = pathMap.get(node);
    }

    // New in v10: Get state information
    if (componentStateMap.has(node)) {
        context.state = componentStateMap.get(node);
    }

    // New in v10: Get conditional rendering info
    if (conditionalMap.has(node)) {
        context.conditional = conditionalMap.get(node);
    }

    // New in v10: Get deep prop analysis
    if (deepPropMap.has(node)) {
        context.deepProps = deepPropMap.get(node);
    }

    // New in v10: Get logical group
    if (logicalGroupMap.has(node)) {
        context.logicalGroup = logicalGroupMap.get(node);
    }

    // New in v10: Get semantic role
    if (componentRoleMap.has(node)) {
        context.semanticRole = componentRoleMap.get(node);
    }

    componentContextMap.set(node, context);
}

/**
 * Generate a test ID for a component
 */
function generateTestId(
    componentName,
    attributes,
    parentPath,
    path,
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
    // New v10 data structures
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap
) {
    // Create a fingerprint for this component for caching
    const componentFingerprint = createComponentFingerprint(componentName, attributes, parentPath);

    // Check if we already have a test ID for this component fingerprint
    if (testIdCache.has(componentFingerprint)) {
        return testIdCache.get(componentFingerprint);
    }

    // Check if component is in a loop/map
    let isLooped = false;
    if (parentPath && loopMap.has(parentPath.node)) {
        isLooped = true;

        // For dynamic loop items, create a dynamic test ID
        if (keyExpressionMap.has(path.node) ||
            (parentPath.node && keyExpressionMap.has(parentPath.node))) {
            return {
                isDynamic: true,
                node: path.node,
                componentName
            };
        }
    }

    // Create a test ID based on the component name and any identifying attributes
    const lowerName = componentName.toLowerCase();
    let suffix = '';
    let attributeFound = false;

    const context = componentContextMap.get(path.node);

    // If we have context information, use it
    if (context) {
        // Get component role if available (new in v10)
        if (options.roleInference && context.semanticRole && context.semanticRole !== lowerName) {
            suffix = context.semanticRole;
            attributeFound = true;
            if (options.verbose) console.log(`Using inferred role: ${suffix}`);
        }

        // Use state information for enhanced context (new in v10)
        if (!attributeFound && options.stateAware && Object.keys(context.state).length > 0) {
            // Get the most meaningful state value
            const priorityStates = ['variant', 'status', 'state', 'color', 'size'];
            let stateValue = '';

            // Try to get a priority state value
            for (const stateName of priorityStates) {
                if (context.state[stateName]) {
                    stateValue = context.state[stateName];
                    break;
                }
            }

            // If no priority state found, get any state value
            if (!stateValue) {
                const stateKeys = Object.keys(context.state);
                if (stateKeys.length > 0) {
                    const firstKey = stateKeys[0];
                    stateValue = context.state[firstKey];
                    if (typeof stateValue === 'boolean') {
                        stateValue = firstKey; // use state name for boolean values
                    }
                }
            }

            if (stateValue && typeof stateValue === 'string') {
                suffix = stateValue.toLowerCase().replace(/\s+/g, '-');
                attributeFound = true;
                if (options.verbose) console.log(`Using component state: ${suffix}`);
            }
        }

        // Use logical group if available (new in v10)
        if (!attributeFound && options.groupDetection && context.logicalGroup) {
            let groupInfo = '';
            if (context.logicalGroup.role && context.logicalGroup.role !== lowerName) {
                groupInfo = `${context.logicalGroup.type}-${context.logicalGroup.role}`;
            } else {
                groupInfo = context.logicalGroup.type;
            }

            suffix = groupInfo.toLowerCase().replace(/\s+/g, '-');
            attributeFound = true;
            if (options.verbose) console.log(`Using logical group: ${suffix}`);
        }

        // Use conditional rendering pattern if available (new in v10)
        if (!attributeFound && options.conditionAware && context.conditional) {
            let conditionInfo = '';

            if (context.conditional.type !== 'unknown') {
                // Use condition type (e.g., "loading", "error", etc.)
                conditionInfo = `${context.conditional.type}-${context.conditional.branch}`;
            } else if (context.conditional.variable) {
                // Use condition variable name
                conditionInfo = context.conditional.variable;
            } else {
                // Use branch information as fallback
                conditionInfo = context.conditional.branch;
            }

            suffix = conditionInfo.toLowerCase().replace(/\s+/g, '-');
            attributeFound = true;
            if (options.verbose) console.log(`Using conditional rendering context: ${suffix}`);
        }

        // Use deep prop analysis for meaningful attributes (new in v10)
        if (!attributeFound && options.deepProps && Object.keys(context.deepProps).length > 0) {
            // Priority props to check
            const priorityProps = ['label', 'title', 'placeholder', 'alt', 'name', 'value', 'type', 'for', 'heading', 'variant'];

            for (const propName of priorityProps) {
                if (context.deepProps[propName] && typeof context.deepProps[propName] === 'string') {
                    suffix = context.deepProps[propName].toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]/g, '')
                        .substring(0, 20); // limit length

                    if (suffix) {
                        attributeFound = true;
                        if (options.verbose) console.log(`Using deep prop ${propName}: ${suffix}`);
                        break;
                    }
                }
            }

            // If no priority prop found, look for any descriptive prop
            if (!attributeFound) {
                const propKeys = Object.keys(context.deepProps);
                for (const propName of propKeys) {
                    // Skip non-descriptive props
                    if (['className', 'style', 'src', 'href', 'target', 'rel', 'disabled', 'ref'].includes(propName)) {
                        continue;
                    }

                    if (typeof context.deepProps[propName] === 'string') {
                        suffix = context.deepProps[propName].toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w-]/g, '')
                            .substring(0, 20); // limit length

                        if (suffix) {
                            attributeFound = true;
                            if (options.verbose) console.log(`Using prop ${propName}: ${suffix}`);
                            break;
                        }
                    }
                }
            }
        }

        // If text-based naming is enabled, extract text from child elements
        if (!attributeFound && options.textBased && options.prioritizeText && context.text) {
            const text = context.text;

            if (text) {
                // Process the text to create a readable ID segment
                suffix = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove punctuation
                    .trim()
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .substring(0, 30); // Limit length

                if (suffix) {
                    attributeFound = true;
                    if (options.verbose) console.log(`Using text content: ${suffix}`);
                }
            }
        }

        // Check for class names
        if (!attributeFound && options.classBased && context.className) {
            const className = context.className;
            // Extract meaningful parts from class names
            const classSegments = className.split(/\s+/)
                .filter(cls => cls.length > 2 && !cls.match(/^(w|h|p|m|mt|mb|ml|mr|mx|my|pt|pb|pl|pr|px|py)-\d+$/))
                .map(cls => cls.replace(/^(hover|active|focus):/, ''));

            if (classSegments.length > 0) {
                // Determine if it's a framework class
                if (className.startsWith('tailwind:') || className.startsWith('bootstrap:')) {
                    // For framework classes, get the most semantic one
                    const semanticClasses = classSegments.filter(cls =>
                        !cls.match(/^(flex|grid|block|inline|none|w-|h-|text-|bg-|border-|rounded-|shadow-|p-|m-)/)
                    );

                    if (semanticClasses.length > 0) {
                        suffix = semanticClasses[0];
                    } else {
                        // If no semantic class found, use the first one
                        suffix = classSegments[0];
                    }
                } else {
                    // For custom classes, use the most specific one
                    suffix = classSegments
                        .sort((a, b) => b.length - a.length)[0]
                        .replace(/^(hover|active|focus):/, '');
                }

                if (suffix) {
                    attributeFound = true;
                    if (options.verbose) console.log(`Using class name: ${suffix}`);
                }
            }
        }

        // Check for sx props
        if (!attributeFound && options.sxBased && Object.keys(context.sxProps).length > 0) {
            // Try to get descriptive sx props
            const sxProps = context.sxProps;
            const descriptiveProps = ['variant', 'color', 'colorScheme', 'size', 'textStyle', 'layerStyle'];

            for (const propName of descriptiveProps) {
                if (sxProps[propName]) {
                    suffix = sxProps[propName].toString()
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]/g, '');

                    if (suffix) {
                        attributeFound = true;
                        if (options.verbose) console.log(`Using sx prop ${propName}: ${suffix}`);
                        break;
                    }
                }
            }
        }

        // Check for semantic group
        if (!attributeFound && context.groupType) {
            suffix = context.groupType.toLowerCase();
            attributeFound = true;
            if (options.verbose) console.log(`Using semantic group: ${suffix}`);
        }
    }

    // Check for id attribute
    if (!attributeFound) {
        if (idPropMap.has(path.node)) {
            suffix = idPropMap.get(path.node);
            attributeFound = true;
            if (options.verbose) console.log(`Using id attribute: ${suffix}`);
        }
    }

    // Check for comments
    if (!attributeFound && options.commentBased) {
        const node = path.node;
        if (commentMap.has(node)) {
            const commentText = commentMap.get(node);

            if (commentText) {
                // Extract a concise description from the comment
                let commentContext = '';

                // Extract words that might be meaningful
                const words = commentText
                    .split(/\s+/)
                    .filter(word =>
                        word.length > 2 &&
                        !/^[0-9.]+$/.test(word) &&
                        !['the', 'and', 'for', 'with', 'this', 'that'].includes(word.toLowerCase())
                    )
                    .slice(0, 3); // Take up to 3 words

                if (words.length > 0) {
                    commentContext = words.join('-').toLowerCase().replace(/[^\w-]+/g, '');
                }

                if (commentContext) {
                    suffix = commentContext;
                    attributeFound = true;
                    if (options.verbose) console.log(`Using comment context: ${suffix}`);
                }
            }
        }
    }

    // If we still don't have a suffix and pathContext is enabled, use path context
    if (!attributeFound && options.pathContext && parentPath && pathMap) {
        const path = pathMap.get(parentPath.node);
        if (path && path.length > 0) {
            // Take the last segment of the path as context
            suffix = path[path.length - 1].toLowerCase();
            if (suffix !== lowerName) { // Don't duplicate component name
                attributeFound = true;
                if (options.verbose) console.log(`Using path context: ${suffix}`);
            }
        }
    }

    // Create the base test ID with improved semantics
    let baseId;
    if (attributeFound && suffix) {
        // If suffix already contains component type, don't duplicate it
        if (suffix.includes(lowerName) ||
            (lowerName === 'button' && suffix.endsWith('btn'))) {
            baseId = suffix;
        } else {
            baseId = `${lowerName}-${suffix}`;
        }
    } else {
        // Add semantic role-based naming for common components
        baseId = getComponentRoleBasedId(lowerName);
    }

    // Apply user-provided prefix
    const prefixedId = options.prefix ? options.prefix + baseId : baseId;

    // Ensure uniqueness
    if (!counters[prefixedId]) {
        counters[prefixedId] = 0;
    }

    counters[prefixedId]++;

    // For first item of a kind, prefer not to add numeric suffix
    if (counters[prefixedId] === 1 && !isLooped) {
        // Store in cache and registry
        const finalId = prefixedId;
        testIdCache.set(componentFingerprint, finalId);
        testIdRegistry.add(finalId);
        return finalId;
    }

    // For looped items, use the key directly if we have access to key info
    if (isLooped) {
        const keyValue = keyPropMap.get(parentPath ? parentPath.node : null);
        if (keyValue) {
            // If the key prop exists, use it directly as the test ID
            const keyBasedId = options.prefix ? options.prefix + keyValue : keyValue;
            testIdCache.set(componentFingerprint, keyBasedId);
            testIdRegistry.add(keyBasedId);
            return keyBasedId;
        }
    }

    // Keep generating IDs until we find a unique one
    let uniqueId;
    let counter = counters[prefixedId];

    do {
        uniqueId = `${prefixedId}-${counter}`;
        counter++;
    } while (testIdRegistry.has(uniqueId));

    counters[prefixedId] = counter;
    testIdCache.set(componentFingerprint, uniqueId);
    testIdRegistry.add(uniqueId);

    return uniqueId;
}

/**
 * Create a fingerprint for component caching
 */
function createComponentFingerprint(componentName, attributes, parentPath) {
    const attributeNames = attributes
        .filter(attr => t.isJSXAttribute(attr))
        .map(attr => attr.name.name)
        .sort()
        .join(',');

    const parentComponent = parentPath && parentPath.node.openingElement &&
        t.isJSXIdentifier(parentPath.node.openingElement.name) ?
        parentPath.node.openingElement.name.name : 'none';

    return `${componentName}:${attributeNames}:${parentComponent}`;
}

/**
 * Create a dynamic test ID using the key expression
 */
function createDynamicTestId(node, prefix, keyExpressionMap) {
    // Check if we have a key expression stored for this node
    if (keyExpressionMap.has(node)) {
        const keyExpr = keyExpressionMap.get(node);

        // Create a template literal or use the key expression directly
        if (prefix) {
            // Create a template literal with prefix: `${prefix}${keyExpr}`
            return t.templateLiteral(
                [
                    t.templateElement({ raw: prefix, cooked: prefix }, false),
                    t.templateElement({ raw: '', cooked: '' }, true)
                ],
                [keyExpr]
            );
        } else {
            // Use the key expression directly
            return keyExpr;
        }
    }

    return null;
}

/**
 * Get component ID based on semantic role
 */
function getComponentRoleBasedId(lowerName) {
    switch (lowerName) {
        case 'div':
            return 'container';
        case 'button':
            return 'btn';
        case 'img':
        case 'image':
            return 'img';
        case 'ul':
        case 'ol':
            return 'list';
        case 'li':
            return 'list-item';
        case 'input':
            return 'input-field';
        case 'select':
            return 'dropdown';
        case 'textarea':
            return 'text-area';
        case 'a':
        case 'link':
            return 'link';
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            return 'heading';
        case 'p':
            return 'paragraph';
        case 'span':
            return 'text';
        case 'nav':
            return 'navigation';
        case 'header':
            return 'header';
        case 'footer':
            return 'footer';
        case 'form':
            return 'form';
        case 'section':
            return 'section';
        case 'article':
            return 'article';
        case 'main':
            return 'main-content';
        case 'aside':
            return 'sidebar';
        case 'dialog':
        case 'modal':
            return 'dialog';
        case 'table':
            return 'table';
        case 'tr':
            return 'table-row';
        case 'td':
            return 'table-cell';
        case 'th':
            return 'table-header';
        default:
            return lowerName;
    }
}

/**
 * Process the AST and add data-testid attributes
 */
function addTestIds(
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
    // New v10 data structures
    componentStateMap,
    conditionalMap,
    deepPropMap,
    logicalGroupMap,
    componentRoleMap
) {
    // Count of attributes added
    let addedCount = 0;
    const componentTypesCount = {
        chakra: 0,
        custom: 0,
        html: 0
    };

    // Process the AST and add data-testid attributes
    traverse(ast, {
        JSXOpeningElement(path) {
            const node = path.node;

            // Handle different types of JSX elements (normal and namespaced)
            let componentName;
            let isNamespaced = false;

            if (t.isJSXIdentifier(node.name)) {
                // Normal JSX element like <div> or <Box>
                componentName = node.name.name;
            } else if (t.isJSXMemberExpression(node.name)) {
                // Namespaced element like <Namespace.Element>
                componentName = node.name.property.name;
                isNamespaced = true;
            } else {
                // Skip other element types
                return;
            }

            // Determine if this is a UI component or HTML element we want to process
            const isChakraComponent = chakraComponents.has(componentName);
            const isCustomComponent = customComponents.has(componentName);
            const isHtmlElement = htmlElements.has(componentName.toLowerCase());

            // Skip processing based on options
            if ((options.htmlOnly && !isHtmlElement) ||
                (options.chakraOnly && !isChakraComponent) ||
                (!isChakraComponent && !isCustomComponent && !isHtmlElement && !options.includeHtml) ||
                isNamespaced) { // Skip namespaced elements
                return;
            }

            // Skip if already has data-testid
            const hasTestId = node.attributes.some(attr =>
                t.isJSXAttribute(attr) &&
                (attr.name.name === 'data-testid' || attr.name.name === 'data-test-id')
            );

            if (hasTestId) {
                return;
            }

            // Get parent JSX element for context
            const parentPath = path.findParent(p => p.isJSXElement());

            // Generate a unique test ID
            const testIdResult = generateTestId(
                componentName,
                node.attributes,
                parentPath,
                path,
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
                // New v10 data structures
                componentStateMap,
                conditionalMap,
                deepPropMap,
                logicalGroupMap,
                componentRoleMap
            );

            // Handle dynamic test IDs
            if (typeof testIdResult === 'object' && testIdResult.isDynamic) {
                // Create a dynamic data-testid using the key expression
                const dynamicExpr = createDynamicTestId(testIdResult.node, options.prefix, keyExpressionMap);
                if (dynamicExpr) {
                    // Create JSX attribute with expression container
                    node.attributes.push(
                        t.jsxAttribute(
                            t.jsxIdentifier('data-testid'),
                            t.jsxExpressionContainer(dynamicExpr)
                        )
                    );

                    addedCount++;

                    if (isChakraComponent) {
                        componentTypesCount.chakra++;
                    } else if (isCustomComponent) {
                        componentTypesCount.custom++;
                    } else if (isHtmlElement) {
                        componentTypesCount.html++;
                    }

                    // Update counters
                    const typeKey = componentName.toLowerCase();
                    counters[typeKey] = (counters[typeKey] || 0) + 1;
                }
            } else if (typeof testIdResult === 'string') {
                // Add the test ID attribute to the JSX element
                node.attributes.push(
                    t.jsxAttribute(
                        t.jsxIdentifier('data-testid'),
                        t.stringLiteral(testIdResult)
                    )
                );

                addedCount++;

                if (isChakraComponent) {
                    componentTypesCount.chakra++;
                } else if (isCustomComponent) {
                    componentTypesCount.custom++;
                } else if (isHtmlElement) {
                    componentTypesCount.html++;
                }

                // Update counters
                const typeKey = componentName.toLowerCase();
                counters[typeKey] = (counters[typeKey] || 0) + 1;
            }
        }
    });

    return { addedCount, componentTypesCount };
}

// Export the functions
module.exports = {
    getTextFromJSXElement,
    identifyInteractiveElements,
    buildComponentContext,
    generateTestId,
    createComponentFingerprint,
    createDynamicTestId,
    getComponentRoleBasedId,
    addTestIds
};