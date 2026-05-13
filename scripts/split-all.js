const { Project } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths('src_impl/**/*.ts');
project.addSourceFilesAtPaths('src_impl/**/*.tsx');

let filesProcessed = 0;

for (const sourceFile of project.getSourceFiles()) {
  const lineCount = sourceFile.getEndLineNumber();
  if (lineCount > 200) {
    console.log(`Processing ${sourceFile.getBaseName()} (${lineCount} lines)`);
    const dir = sourceFile.getDirectoryPath();
    const baseName = sourceFile.getBaseNameWithoutExtension();
    const ext = sourceFile.getExtension();
    
    // Extract Interfaces
    const interfaces = sourceFile.getInterfaces();
    if (interfaces.length > 0) {
      const typesFile = project.createSourceFile(path.join(dir, `${baseName}.types${ext}`), '', { overwrite: true });
      for (const intf of interfaces) {
        if (intf.isExported()) {
          typesFile.addInterface(intf.getStructure());
          intf.remove();
        }
      }
      sourceFile.addExportDeclaration({ moduleSpecifier: `./${baseName}.types` });
    }

    // Extract Type Aliases
    const typeAliases = sourceFile.getTypeAliases();
    if (typeAliases.length > 0) {
      const typesFile = project.getSourceFile(path.join(dir, `${baseName}.types${ext}`)) || project.createSourceFile(path.join(dir, `${baseName}.types${ext}`), '', { overwrite: true });
      for (const type of typeAliases) {
        if (type.isExported()) {
          typesFile.addTypeAlias(type.getStructure());
          type.remove();
        }
      }
      if (!sourceFile.getExportDeclarations().some(ed => ed.getModuleSpecifierValue() === `./${baseName}.types`)) {
          sourceFile.addExportDeclaration({ moduleSpecifier: `./${baseName}.types` });
      }
    }

    // If still > 200 lines, extract Enums
    if (sourceFile.getEndLineNumber() > 200) {
      const enums = sourceFile.getEnums();
      if (enums.length > 0) {
        const typesFile = project.getSourceFile(path.join(dir, `${baseName}.types${ext}`)) || project.createSourceFile(path.join(dir, `${baseName}.types${ext}`), '', { overwrite: true });
        for (const en of enums) {
          if (en.isExported()) {
            typesFile.addEnum(en.getStructure());
            en.remove();
          }
        }
      }
    }

    filesProcessed++;
  }
}

project.saveSync();
console.log(`Done processing ${filesProcessed} files.`);
