const core = require('@actions/core');
const github = require('@actions/github');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fileName = core.getInput('version-file');
const defaultBranchName = core.getInput('default-branch-name');
const baseBranch = core.getInput('base-branch');
const mergedRef = core.getInput('merged-ref');

if ( baseBranch == "" ) throw new Error ( "The base branch is not set");
if ( mergedRef == "" ) throw new Error ( "The merged ref is not set");


async function executeBashCommand(command) {
    const res = await exec(command);
    const { stdout, stderr } = res;
    return stdout.replace(/\n/g,'').replace(/\r/g,'');
}

async function isVersionModified() {
	let command = `git diff --name-only "${baseBranch}..${mergedRef}" version.txt | wc -l`;
	var result = await executeBashCommand(command);
	return result != 0;
}

async function verifyVersionChangeInPullRequest() {
	if(baseBranch == defaultBranchName) {
		var result = await isVersionModified();
		console.log("version modification result is "+result);
		
	} else {
		
		
	}	
}

verifyVersionChangeInPullRequest()
.then( x =>  {  console.log(x); core.setFailed("For testing"); })
.catch( x => {console.error(x); core.setFailed("For testing"); });

//master
	//is version modified
		//Ensure no other file is modified
		//Ensure version is properly incremented
	//else
		

//release branch
	//Is version modified throw error
	