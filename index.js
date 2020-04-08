const fs = require('fs');
const Regex = require('regex');
const core = require('@actions/core');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

//const fileName = core.getInput('version-file');

const fileName = './version.txt';
const isReleaseFlow = true;
const currentBranchName = 'master';
const defaultBranchName = 'master';
const releaseBranchPrefix = 'rel-';

function getBaseVersion() {
	if( ! fs.existsSync(fileName)) throw new Error('The file '+fileName+ ' does not exists')
	var version = fs.readFileSync(fileName, 'utf8');
	version = version.trim();
	if(!version.match(/^\d+\.\d+$/)) throw new Error("The "+version+" is not of the format MAJOR.MINOR");
	if (version == '0.0') throw new Error('0.0 is not a valid version. Either major version or minor version has to be non zero');
	if (version.match(/^0\d+\./)) throw new Error("Major version can not be prefixed with 0");
	if (version.match(/\.0\d+$/)) throw new Error("Minor version can not be prefixed with 0");
	return version;
}

async function executeBashCommand(command) {
  const res = await exec(command);
  const { stdout, stderr } = res;
  return stdout;
}

async function getLastVersionChangedCommit() {
	var command =`git log --format=format:%H -n 1 ${fileName}`;
	return await executeBashCommand(command);
}

async function assertLastVersionChangeIsInDefaultBranch(){
	var lastVersionModifiedCommit = await getLastVersionChangedCommit();
	var command = `git branch -r --contains ${lastVersionModifiedCommit} | grep '^\s*origin/${defaultBranchName}$' | wc -l`;
	var result = await executeBashCommand(command);
	if(result == 0 ) throw new Error(`The last version change ${lastVersionModifiedCommit} is not in the default branch: ${defaultBranchName}`);
}

async function getCheckedOutCommit() {
	var command =`git log --format=format:%H -n 1`;
	return await executeBashCommand(command);
}

async function getVersion() {
	var checkedOutCommit = await getCheckedOutCommit();
	var lastVersionChangeCommit = await getLastVersionChangedCommit();
	console.log("Last version change commit is "+ lastVersionChangeCommit);
	//await assertLastVersionChangeIsInDefaultBranch();
	//await assertCurrentCommitIsInTheSpecifiedBranch();
	return checkedOutCommit;
}

try {
	var baseVersion = getBaseVersion();
	console.log("The base version is "+baseVersion);
	getVersion().then( x =>  console.log(x));
} catch (err) {
     console.error(err)
     core.setFailed(err.message);
}
