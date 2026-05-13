const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths('src_impl/**/*.ts');
project.addSourceFilesAtPaths('src_impl/**/*.tsx');

let filesProcessed = 0;

for (const sourceFile of project.getSourceFiles()) {
  const lineCount = sourceFile.getEndLineNumber();
  if (lineCount > 200) {
    console.log(`Splitting ${sourceFile.getFilePath()} (${lineCount} lines)`);
    // Example: extracting all interfaces
    const interfaces = sourceFile.getInterfaces();
    if (interfaces.length > 0) {
      const dir = sourceFile.getDirectoryPath();
      const baseName = sourceFile.getBaseNameWithoutExtension();
      const ext = sourceFile.getExtension();
      
      const newFileName = `${baseName}.types${ext}`;
      const newFilePath = path.join(dir, newFileName);
      
      let newFile;
      if (fs.existsSync(newFilePath)) {
          newFile = project.getSourceFile(newFilePath) || project.addSourceFileAtPath(newFilePath);
      } else {
          newFile = project.createSourceFile(newFilePath, '');
      }

      for (const intf of interfaces) {
        if (intf.isExported()) {
          newFile.addInterface(intf.getStructure());
          intf.remove();
        }
      }
      
      // Update imports if needed (simplistic approach, just add export * from)
      sourceFile.addExportDeclaration({ moduleSpecifier: `./${baseName}.types` });
    }

    filesProcessed++;
  }
}

project.saveSync();
console.log(`Processed ${filesProcessed} oversized files.`);
