const uuidV4 = require('uuid/v4');
const getMergedConfig = require('probot-config');

const App = require('./support');
const schema = require('./schema');

module.exports = async robot => {
  const github = await robot.auth();
  const appName = (await github.apps.get({})).data.name;

  robot.on('issues.labeled', async context => {
    const app = await getApp(context);
    if (app) {
      await app.labeled();
    }
  });

  robot.on('issues.unlabeled', async context => {
    const app = await getApp(context);
    if (app) {
      await app.unlabeled();
    }
  });

  robot.on('issues.reopened', async context => {
    const app = await getApp(context);
    if (app) {
      await app.reopened();
    }
  });

  async function getApp(context) {
    const logger = context.log.child({appName, session: uuidV4()});
    const config = await getConfig(context, logger);
    if (config) {
      return new App(context, config, logger);
    }
  }

  async function getConfig(context, log, file = 'support.yml') {
    let config;
    const repo = context.repo();
    try {
      let repoConfig = await getMergedConfig(context, file);
      if (!repoConfig) {
        log.warn({repo, file}, 'Missing config');
        repoConfig = {perform: false};
      }
      const {error, value} = schema.validate(repoConfig);
      if (error) {
        throw error;
      }
      config = value;
    } catch (err) {
      log.warn({err: new Error(err), repo, file}, 'Invalid config');
    }

    return config;
  }
};
