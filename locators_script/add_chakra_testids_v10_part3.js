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
  switch(lowerName) {
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