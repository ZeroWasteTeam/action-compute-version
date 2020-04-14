const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fileName = core.getInput('version-file');
const defaultBranchName = core.getInput('default-branch-name');
const baseBranch = core.getInput('base-branch');
const mergedSha = core.getInput('merged-ref');
const originBaseBranch = 'origin/'+baseBranch;

core.debug('Action started');
core.debug(`Version file name is ${fileName}`);
core.debug(`Default branch name is ${defaultBranchName}`);
core.debug(`The base branch is ${baseBranch}`);
core.debug(`The merged sha is ${mergedSha}`);
core.debug(`The origin base branch is  ${originBaseBranch}`);

if ( baseBranch == "" ) throw new Error ( "The base branch is not set");
if ( mergedSha == "" ) throw new Error ( "The merged ref is not set");

async function executeBashCommand(command) {	
    const res = await exec(command);
    const { stdout, stderr } = res;
    let result = stdout.replace(/\n/g,'').replace(/\r/g,'');
	core.debug(`Executed command: ${command} and the result: ${result}`);
	return result;
}

async function isVersionModified() {
	let command = `git diff --name-only "${originBaseBranch}..${mergedSha}" ${fileName} | wc -l`;
	let result = await executeBashCommand(command);s
	return result != 0;
}


async function isNonVersionFilesModified(isVersionModified) {
	let command = `git diff --name-only "${baseBranch}..${mergedSha}"  | wc -l`;
	var result = await executeBashCommand(command);
	let numberOfNonVersionFilesModified =  isVersionModified? result - 1 : result;
	return (numberOfNonVersionFilesModified != 0);
}

async function verifyVersionChangeInPullRequest() {
	core.debug(`Verifying version change`);
	if(baseBranch == defaultBranchName) {
		core.debug(`Base branch and default branch name is same: ${baseBranch}`);
		if(await isVersionModified()){
			core.debug(`The version file is modified`);
			if(await isNonVersionFilesModified(isVersionModified = true)){
				core.debug(`Files other than version file are also modified`);
				throw new Error("When modifying version file. No other file should be modified");
			} 
			let baseVersion = await getBaseVersion(baseBranch);
			baseVersion = baseVersion.trim();
			let modifiedVersion = await getBaseVersion(mergedSha);
			modifiedVersion = modifiedVersion.trim();
			
			if(modifiedVersion == "") {
				core.debug("Could not read the version information. This happens when version file : ${fileName} is not present");
				throw new Error(`Could not read the version from ${fileName}`);
			}
			validateBaseVersion(modifiedVersion);
			let isValidBaseVersion = false;
			try{
				validateBaseVersion(baseVersion);
				isValidBaseVersion = true;
			}catch(err){
				
			}
			
			var baseVersionFloat = parseFloat(baseVersion);
			var modifiedVersionFloat = parseFloat(modifiedVersion);
			
			if( baseVersionFloat >= modifiedVersionFloat) {
				throw new Error(`The version is not incremented. The old base version is ${baseVersionFloat} the new is ${modifiedVersionFloat}`);
			}
		}else{
			core.debug(`Version file is not modified`);
			return;
		}
	} else {
		if(await isVersionModified()){
			core.debug(`Version file is modified`);
			throw new Error("Version file modification is not permitted in ");		
		} 
	}	
}

function validateBaseVersion(version) {
	
	if(!version.match(/^\d+\.\d+$/)) throw new Error(`The version: ${version}" is not of the format MAJOR.MINOR`);
	if (version == '0.0') throw new Error('0.0 is not a valid version. Either major version or minor version has to be non zero');
	if (version.match(/^0\d+\./)) throw new Error("Major version can not be prefixed with 0");
	if (version.match(/\.0\d+$/)) throw new Error("Minor version can not be prefixed with 0");
	return version;
}

async function getBaseVersion(ref){
	let command = 'git show "${ref}:version.txt"'
	return await executeBashCommand(command);
}

verifyVersionChangeInPullRequest()
.then( x =>  {  console.log(`There is no problem in versioning!!!`); core.setFailed("For testing"); })
.catch( x => {console.error(x); core.setFailed("For testing"); });
