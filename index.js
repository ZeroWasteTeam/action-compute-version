const fs = require('fs');
const Regex = require('regex');
const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fileName = core.getInput('version-file');
const isReleaseFlow = core.getInput('is-release-flow');
const currentBranchName = core.getInput('current-branch');
const defaultBranchName = core.getInput('default-branch-name');
const releaseBranchPrefix = core.getInput('release-branch-prefix');


console.log(JSON.stringfy(github, null, "\t"));



/*
const fileName = './version.txt';
const isReleaseFlow = true;
const currentBranchName = 'master';
const defaultBranchName = 'master';
const releaseBranchPrefix = 'rel-';
*/

if ( current-branch == "" ) throw new Error ( "The current branch input parameter has not been set");

function getBaseVersion() {
	if( ! fs.existsSync(fileName)) throw new Error(`The version file: ${fileName} does not exists`)
	var version = fs.readFileSync(fileName, 'utf8');
	version = version.trim();
	if(!version.match(/^\d+\.\d+$/)) throw new Error(`The version: ${version}" is not of the format MAJOR.MINOR`);
	if (version == '0.0') throw new Error('0.0 is not a valid version. Either major version or minor version has to be non zero');
	if (version.match(/^0\d+\./)) throw new Error("Major version can not be prefixed with 0");
	if (version.match(/\.0\d+$/)) throw new Error("Minor version can not be prefixed with 0");
	return version;
}

async function executeBashCommand(command) {
  const res = await exec(command);
  const { stdout, stderr } = res;
  return stdout.replace(/\n/g,'').replace(/\r/g,'');
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

async function getDefaultBranchBuildVersion(baseVersion, lastVersionChangeCommit, shortCommitId, dateString) {
	var buildNumber = await getNumberOfCommitsSince(lastVersionChangeCommit);
	if(buildNumber == 0) {
		return `${baseVersion}.${buildNumber}`;
	}else{
		return `${baseVersion}.${buildNumber}-${dateString}-${shortCommitId}`;
	}
}

async function getCheckoutCommitsDateString() {
	var command = `git log -1 --format="%at" --date=iso | xargs -I{} date -u -d @{} +%Y-%m-%d-%H-%M-%S`;
	return await executeBashCommand(command);
}

async function getShortCommitId(commitId) {
	var command = `git rev-parse --short=7 ${commitId}`;
	return await executeBashCommand(command);
}

async function getNumberOfCommitsSince(commit) {
	var command= `git rev-list ${commit}..HEAD --count`;
	return executeBashCommand(command);
}

async function getReleaseBranchBuildVersion(baseVersion, shortCommitId, dateString) {
	var releaseName = currentBranchName.replace(releaseBranchPrefix, "").toLowerCase();
	return `${baseVersion}-${releaseName}-${dateString}-${shortCommitId}`;
}

async function getTestBranchBuildVersion(baseVersion, shortCommitId, dateString) {
	var releaseName = currentBranchName.replace(releaseBranchPrefix, "").toLowerCase();
	return `${baseVersion}-test-${dateString}-${shortCommitId}`;
}

async function getVersion() {
	var checkedOutCommit = await getCheckedOutCommit();
	console.log(`The checked out commit is ${checkedOutCommit}`);
	
	var lastVersionChangeCommit = await getLastVersionChangedCommit();
	console.log(`The last version modified commit is ${lastVersionChangeCommit}`);
	
	console.log(`The build triggered for commit in branch ${currentBranchName}`);
	
	if(!await isCommitInOriginBranch(lastVersionChangeCommit, defaultBranchName)) 
		throw new Error(`The last version change commit: ${lastVersionChangeCommit} is not in default origin branch: ${defaultBranchName}`);
	
	if(!await isCommitInOriginBranch(checkedOutCommit, currentBranchName)) 
		throw new Error(`The checked out commit : ${checkedOutCommit} is not in building origin branch: ${currentBranchName}`);
	
	var baseVersion = getBaseVersion();
	var shortCommitId = await getShortCommitId(checkedOutCommit);
	var dateString = await getCheckoutCommitsDateString();
	if( currentBranchName == defaultBranchName ) return await getDefaultBranchBuildVersion(baseVersion, lastVersionChangeCommit, shortCommitId, dateString);
	if( isReleaseFlow && currentBranchName.startsWith(releaseBranchPrefix)) return await getReleaseBranchBuildVersion(baseVersion, shortCommitId, dateString);
	return await getTestBranchBuildVersion(baseVersion, shortCommitId, dateString);
}

getVersion()
.then( x =>  {  console.log(x); core.setOutput('version', x); })
.catch( x => {console.error(x); core.setFailed(x.message)});
