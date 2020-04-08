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

async function isCommitInOriginBranch(commit, branch){
	var command = `git branch -r --contains ${commit} | grep '^\\s*origin/${branch}$' | wc -l`;
	var result = await executeBashCommand(command);
	if(result == 0 ) return false;
	else return true;
}

async function getCheckedOutCommit() {
	var command =`git log --format=format:%H -n 1`;
	return await executeBashCommand(command);
}

async function getVersion() {
	var checkedOutCommit = await getCheckedOutCommit();
	console.log(`The checked out commit is ${checkedOutCommit}`);
	
	var lastVersionChangeCommit = await getLastVersionChangedCommit();
	console.log(`The last version modified commit is ${lastVersionChangeCommit}`);
	
	console.log(`The build triggered for commit in branch ${currentBranchName}`);
	
	if(!await isCommitInOriginBranch(lastVersionChangeCommit, defaultBranchName)) throw new Error('The last version change commit is not in default origin branch');
	
	if(!await isCommitInOriginBranch(checkedOutCommit, currentBranchName)) throw new Error('The checked out commit is not in building origin branch');
	
	
	//is version modified
		//is version incremented else Error
	
		
	
	
	//console.log(isCommitProper);
	
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
