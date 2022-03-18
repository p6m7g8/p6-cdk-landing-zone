const { AwsCdkTypeScriptApp } = require('projen');

/**
 * An AWS CDK TypeScript Application
 * Applications unlike Constructs can be directly deployed
 *
 */
const project = new AwsCdkTypeScriptApp({
  /**
   * The master smile-cdk version
   * https://github.com/projen/projen/blob/master/API.md#struct-awscdktypescriptappoptions--
   */
  cdkVersion: '1.96.0',
  name: 'smile-cdk',
  description: 'Organization Landing Zone Machine and Account Provisioner for the Enterprise',
  authorOrganization: 'trexsolutions', // This must match the NPMJS organization
  authorName: 'T-Rex Centers of Excellence (CoE)',
  authorEmail: 'coeteam@trexsolutionsllc.com',
  repository: 'https://github.com/trexsolutions/smile-cdk.git',
  keywords: [
    'landing zones',
    'cdk',
    'security',
    'account vending machine',
    'devsecops',
  ],

  defaultReleaseBranch: 'main',

  appEntrypoint: 'bin/smile-cdk',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN', // XXX: need to add this secret in GitHub
  codeCov: true,
  gitpod: true,
  // docgen: true,

  cdkDependencies: [
    '@aws-cdk/aws-cloudtrail',
    '@aws-cdk/aws-codebuild',
    '@aws-cdk/aws-codepipeline',
    '@aws-cdk/aws-codepipeline-actions',
    '@aws-cdk/aws-config',
    '@aws-cdk/aws-dlm',
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecr',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-imagebuilder',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-kms',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-sns',
    '@aws-cdk/aws-sns-subscriptions',
  ],

  deps: [
    'p6-namer@^0.7.45',
    '@types/js-yaml@^3.12.5',
    'js-yaml@^3.14.0',
  ],

  devDeps: [
    'fs@^0.0.2',
    'markdownlint-cli@^0.24.0',
    'esbuild@^0',
  ],
});

project.gitignore.exclude('.node-version');

/**
 * Other things to not put in GitHub
 */
project.gitignore.exclude('cdk.context.json');
project.gitignore.exclude('yq');
project.gitignore.exclude('.tools');

/**
 * Tasks
 */
const buildTask = project.buildTask;
buildTask.prepend(
  'bin/smilectl conf_merge', {
    description: 'Generates dist/config.yml from SMILE_CF',
  },
);

project.addTask('version').exec(
  "node -p -e \"require(\'./package.json\').version\"", {
    description: 'Displays the version',
  },
);

project.addTask('deploy').exec(
  'bin/smilectl deploy', {
    description: 'Provisions the current account',
  },
);

project.addTask('destroy').exec(
  'bin/smilectl destroy', {
    description: 'De-Provisions the current account',
  },
);

project.addTask('avm:create').exec(
  'bin/smilectl avm_create', {
    description: 'Creates an Account',
  },
);

project.addTask('avm:provision').exec(
  'bin/smilectl avm_provision', {
    description: 'Provisions and account via the OrganizationAccountAccessRole',
  },
);

/*
project.addTask('avm:provision').exec(
  'bin/smilectl avm_provision', {
    description: 'Provisions and account via the OrganizationAccountAccessRole',
  },
);
*/

project.addTask('lz:make').exec(
  'bin/smilectl lz_make', {
    description: 'Creates via avm:create and provisions via avm:provision all accounts in the landing zone',
  },
);

/**
 * Label pgollucci PR as contribution/core which is common in OSS
 */
project.github.addMergifyRules({
  name: 'Label core contributions',
  actions: {
    label: {
      add: ['contribution/core'],
    },
  },
  conditions: [
    'author~=^(pgollucci)$',
    'label!=contribution/core',
  ],
});

/**
 * Until more than one person, auto-merge core PRs if CI passes
 */
project.github.addMergifyRules({
  name: 'Label auto-merge for core',
  actions: {
    label: {
      add: ['auto-merge'],
    },
  },
  conditions: [
    'label=contribution/core',
    'label!=auto-merge',
  ],
});

project.github.addMergifyRules({
  name: 'Label auto-merge snyk-bot',
  actions: {
    merge: {
      method: 'squash',
      commit_message: 'title+body',
      strict: 'smart',
      strict_method: 'merge',
    },
  },
  conditions: [
    'author=snyk-bot',
    'status-success=build',
  ],
});

/**
 * Setups up gitpod
 * `githubfull-workspace uses` `apt`
 * need a `smile_cmd_gitpod_deps`
 */
project.gitpod.addTasks({
  name: 'Setup',
  init: 'yarn install',
  //  prebuild: 'XXX',
  command: 'npx projen build',
});

/**
 * Write it to the directory
 */
project.synth();
