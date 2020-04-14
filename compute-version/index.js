const fs = require('fs');
const Regex = require('regex');
const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const versionFileName = core.getInput('version-file');
const isReleaseFlow = core.getInput('is-release-flow');
const buildBranch = core.getInput('current-branch').replace('refs/heads/','');
const defaultBranchName = core.getInput('default-branch-name');
const releaseBranchPrefix = core.getInput('release-branch-prefix');

core.debug(`Action started`);

if ( buildBranch == "" ) throw new Error ( "The current branch input parameter has not been set");

function getBaseVersion() {
	if( ! fs.existsSync(versionFileName)) throw new Error(`The version file: ${versionFileName} does not exists`)
	let version = fs.readFileSync(versionFileName, 'utf8');
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
  let result = stdout.replace(/\n/g,'').replace(/\r/g,'');
  core.debug(`The executed command: ${command}. The result is ${result}`);
  return result;
}

async function getLastVersionChangedCommit() {
	let command =`git log --format=format:%H -n 1 ${versionFileName}`;
	return await executeBashCommand(command);
}

async function isCommitInOriginBranch(commit, branch){
	let command = `git branch -r --contains ${commit} | grep '^\\s*origin/${branch}$' | wc -l`;
	let result = await executeBashCommand(command);
	if(result == 0 ) return false;
	else return true;
}

async function getCheckedOutCommit() {
	let command =`git log --format=format:%H -n 1`;
	return await executeBashCommand(command);
}

async function getDefaultBranchBuildVersion(baseVersion, lastVersionChangeCommit, shortCommitId, dateString) {
	let buildNumber = await getNumberOfCommitsSince(lastVersionChangeCommit);
	if(buildNumber == 0) {
		return `${baseVersion}.${buildNumber}`;
	}else{
		return `${baseVersion}.${buildNumber}-${dateString}-${shortCommitId}`;
	}
}

async function getCheckoutCommitsDateString() {
	let command = `git log -1 --format="%at" --date=iso | xargs -I{} date -u -d @{} +%Y-%m-%d-%H-%M-%S`;
	return await executeBashCommand(command);
}

async function getShortCommitId(commitId) {
	let command = `git rev-parse --short=7 ${commitId}`;
	return await executeBashCommand(command);
}

async function getNumberOfCommitsSince(commit) {
	let command= `git rev-list ${commit}..HEAD --count`;
	return executeBashCommand(command);
}

async function getReleaseBranchBuildVersion(baseVersion, shortCommitId, dateString) {
	let releaseName = buildBranch.replace(releaseBranchPrefix, "").toLowerCase();
	return `${baseVersion}-${releaseName}-${dateString}-${shortCommitId}`;
}

async function getTestBranchBuildVersion(baseVersion, shortCommitId, dateString) {
	return `${baseVersion}-test-${dateString}-${shortCommitId}`;
}

async function getVersion() {
	let checkedOutCommit = await getCheckedOutCommit();
	core.debug(`The checked out commit is ${checkedOutCommit}`);
		
	let lastVersionChangeCommit = await getLastVersionChangedCommit();
	core.debug(`The last version modified commit is ${lastVersionChangeCommit}`);
	
	core.debug(`The build triggered for commit in branch ${buildBranch}`);

	if(!await isCommitInOriginBranch(checkedOutCommit, buildBranch)) {
		console.log(`The last commit: ${lastVersionChangeCommit} is not in  build branch: origin\\${buildBranch}`);
		throw new Error(`The checked out commit : ${checkedOutCommit} is not in building origin branch: ${buildBranch}`);
	}else{
		console.log(`The last commit: ${lastVersionChangeCommit} is in build branch: origin\\${buildBranch}`);
	}

	if(!await isCommitInOriginBranch(lastVersionChangeCommit, defaultBranchName)) {
		core.debug(`The latest version commit: ${lastVersionChangeCommit} is not in default - branch: origin\\${defaultBranchName}`);
		throw new Error(`The last version change commit: ${lastVersionChangeCommit} is not in default origin branch: ${defaultBranchName}`);
	} else {
		core.debug(`The latest version commit: ${lastVersionChangeCommit} is in default - branch: origin\\${defaultBranchName}`);
	}
	
	let baseVersion = getBaseVersion();
	let shortCommitId = await getShortCommitId(checkedOutCommit);
	let dateString = await getCheckoutCommitsDateString();
	if( buildBranch == defaultBranchName ) return await getDefaultBranchBuildVersion(baseVersion, lastVersionChangeCommit, shortCommitId, dateString);
	if( isReleaseFlow && buildBranch.startsWith(releaseBranchPrefix)) return await getReleaseBranchBuildVersion(baseVersion, shortCommitId, dateString);
	return await getTestBranchBuildVersion(baseVersion, shortCommitId, dateString);
}

getVersion()
.then( x =>  { console.log(x); core.setOutput('version', x); })
.catch( x => { console.error(x); core.setFailed(x.message)});
