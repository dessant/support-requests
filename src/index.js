const getMergedConfig = require('probot-config');

const App = require('./support');
const schema = require('./schema');

module.exports = robot => {
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
    const config = await getConfig(context);
    if (config) {
      return new App(context, config, robot.log);
    }
  }

  async function getConfig(context) {
    const {owner, repo} = context.issue();
    let config;
    try {
      let repoConfig = await getMergedConfig(context, 'support.yml');
      if (!repoConfig) {
        repoConfig = {perform: false};
      }
      const {error, value} = schema.validate(repoConfig);
      if (error) {
        throw error;
      }
      config = value;
    } catch (err) {
      robot.log.warn({err: new Error(err), owner, repo}, 'Invalid config');
    }

    return config;
  }
};
