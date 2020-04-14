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

async function ExecuteBashCommand(command) {	
    const res = await exec(command);
    const { stdout, stderr } = res;
    let result = stdout.replace(/\n/g,'').replace(/\r/g,'');
	core.debug(`Executed command: ${command} and the result: ${result}`);
	return result;
}

async function IsVersionModified() {
	let command = `git diff --name-only "${originBaseBranch}..${mergedSha}" ${fileName} | wc -l`;
	let result = await ExecuteBashCommand(command);
	return result != 0;
}


async function IsNonVersionFilesModified(isVersionModified) {
	let command = `git diff --name-only "${originBaseBranch}..${mergedSha}"  | wc -l`;
	var result = await ExecuteBashCommand(command);
	let numberOfNonVersionFilesModified =  isVersionModified? result - 1 : result;
	return (numberOfNonVersionFilesModified != 0);
}

async function VerifyVersionChangeInPullRequest() {
	core.debug(`Verifying version change`);
	if(baseBranch == defaultBranchName) {
		core.debug(`Base branch and default branch name is same: ${baseBranch}`);
		if(await IsVersionModified()){
			core.debug(`The version file is modified`);
			if(await IsNonVersionFilesModified(isVersionModified = true)){
				core.debug(`Files other than version file are also modified`);
				throw new Error("When modifying version file. No other file should be modified");
			} 
			let baseVersionOfOriginBaseBranch = await GetBaseVersion(originBaseBranch);
			let baseVersionOfModifiedSha = await GetBaseVersion(mergedSha);
			
			if(baseVersionOfModifiedSha == "") {
				core.debug("Could not read the version information. This happens when version file : ${fileName} is not present");
				throw new Error(`Could not read the version from ${fileName}`);
			}
			ValidateBaseVersion(baseVersionOfModifiedSha);
			let isValidBaseVersion = false;
			
			try{
				ValidateBaseVersion(baseVersionOfOriginBaseBranch);
				isValidBaseVersion = true;
			}catch(err){
				
			}
			
			var versionFromOriginBaseBranchAsFloat = parseFloat(baseVersionOfOriginBaseBranch);
			var versionFromModifiedShaAsFloat = parseFloat(baseVersionOfModifiedSha);
			
			if( versionFromOriginBaseBranchAsFloat >= versionFromModifiedShaAsFloat) {
				throw new Error(`The version is not incremented. The old base version is ${versionFromOriginBaseBranchAsFloat} the new is ${versionFromModifiedShaAsFloat}`);
			}
		}else{
			core.debug(`Version file is not modified`);
			return;
		}
	} else {
		if(await IsVersionModified()){
			core.debug(`Version file is modified`);
			throw new Error("Version file modification is not permitted in ");		
		} 
	}	
}

function ValidateBaseVersion(version) {	
	if(!version.match(/^\d+\.\d+$/)) throw new Error(`The version: ${version}" is not of the format MAJOR.MINOR`);
	if (version == '0.0') throw new Error('0.0 is not a valid version. Either major version or minor version has to be non zero');
	if (version.match(/^0\d+\./)) throw new Error("Major version can not be prefixed with 0");
	if (version.match(/\.0\d+$/)) throw new Error("Minor version can not be prefixed with 0");
	return version;
}

async function GetBaseVersion(ref){
	let command = `git show "${ref}:version.txt"`;
	let result =  await ExecuteBashCommand(command);
	return result.trim();
}

VerifyVersionChangeInPullRequest()
.then( x =>  {  console.log(`There is no problem in versioning!!!`); })
.catch( x => {  console.error(x); core.setFailed(x.message); });
