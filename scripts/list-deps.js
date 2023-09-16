const fs = require('fs');
const path = require('path');

const workspacePath = path.join('/Users/rajan/Desktop/packages/rjnpackages', 'packages')
// Get all of the folders in the workspace
const packageList = fs.readdirSync(workspacePath).filter(file => fs.statSync(path.join(workspacePath, file)).isDirectory());
let packageJsonPath, packageJson;
const outInfo = {};
let depList = [];

for (const pkg of packageList) {
    packageJsonPath = path.join(workspacePath, pkg, 'package.json');
    const { name, dependencies = {}, devDependencies = {} } = JSON.parse(fs.readFileSync(packageJsonPath));

    outInfo[name] = {
        deps: Object.keys(dependencies),
        devDeps: Object.keys(devDependencies),
    }
    if (dependencies) {
        depList = depList.concat(Object.keys(dependencies));
    }

    if (devDependencies) {
        depList = depList.concat(Object.keys(devDependencies))
    }
}

console.log('Pkg Deps: ', outInfo)
console.log('\n ------------------------- \n')
console.log('DepList:', depList)