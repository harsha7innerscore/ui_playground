# JSX Comments Insertion Script

This project contains a utility script for automatically adding comments to JSX files at specific positions.

## Project Structure

- `/src`: Contains the source code for the comments insertion script
- `/tests`: Contains test files and test cases

## Technology Stack

- Node.js 18.x
- Babel libraries for parsing JSX
  - @babel/parser
  - @babel/traverse
  - @babel/types
  - @babel/generator

## Development Commands

- `npm start`: Run the main script
- `npm test`: Run tests

## Functionality

The script analyzes JSX files and inserts comments at specific positions based on the code structure.

### Features (v1)

- Parse JSX files
- Identify components and their structures
- Insert appropriate comments at predetermined positions
- Preserve original formatting and code structure

## Coding Standards

- Use modern JavaScript features (ES6+)
- Follow consistent code style
- Use clear, descriptive variable and function names
- Document functions and complex logic
- Provide helpful error messages

## Implementation Approach

1. Parse JSX code using Babel parser
2. Traverse the AST (Abstract Syntax Tree) to identify components and their structure
3. Determine appropriate positions for comments
4. Insert comments into the code
5. Generate the modified JSX code
6. Write the modified code back to the file (or output new file)