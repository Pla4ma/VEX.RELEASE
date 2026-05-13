const { Project } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths('src_impl/**/*.ts');
project.addSourceFilesAtPaths('src_impl/**/*.tsx');

let filesProcessed = 0;

for (const sourceFile of project.getSourceFiles()) {
  const lineCount = sourceFile.getEndLineNumber();
  // Don't process test files
  if (lineCount > 190 && !sourceFile.getFilePath().includes('__tests__') && !sourceFile.getFilePath().includes('.types.')) {
    console.log(`Deep splitting ${sourceFile.getBaseName()} (${lineCount} lines)`);
    const dir = sourceFile.getDirectoryPath();
    const baseName = sourceFile.getBaseNameWithoutExtension();
    const ext = sourceFile.getExtension();
    
    // We will extract functions, classes, and variable statements into chunk files
    const exportableNodes = [
      ...sourceFile.getFunctions(),
      ...sourceFile.getClasses(),
      ...sourceFile.getVariableStatements()
    ].filter(n => n.isExported() && !n.isDefaultExport());

    if (exportableNodes.length > 2) {
      let currentChunk = 1;
      let currentChunkFile = null;
      let currentChunkLines = 0;
      
      const chunkFilesCreated = [];

      // Sort nodes by their position in the file to maintain some logical order
      exportableNodes.sort((a, b) => a.getStart() - b.getStart());

      for (const node of exportableNodes) {
        if (!currentChunkFile || currentChunkLines > 150) {
          const chunkName = `${baseName}.part${currentChunk}`;
          const chunkPath = path.join(dir, `${chunkName}${ext}`);
          currentChunkFile = project.createSourceFile(chunkPath, '', { overwrite: true });
          chunkFilesCreated.push(chunkName);
          
          // Copy all imports from the original file to the chunk file
          for (const imp of sourceFile.getImportDeclarations()) {
            currentChunkFile.addImportDeclaration(imp.getStructure());
          }
          currentChunk++;
          currentChunkLines = 0;
        }

        const nodeText = node.getText();
        const nodeLines = nodeText.split('\n').length;
        currentChunkFile.insertText(currentChunkFile.getEnd(), '\n\n' + nodeText);
        currentChunkLines += nodeLines;
        node.remove();
      }

      // Add re-exports to the original file
      for (const chunkName of chunkFilesCreated) {
        sourceFile.addExportDeclaration({ moduleSpecifier: `./${chunkName}` });
      }
      
      filesProcessed++;
    }
  }
}

project.saveSync();
console.log(`Deep split ${filesProcessed} files.`);
