const Support = require('./support');
const schema = require('./schema');

module.exports = robot => {
  robot.on('issues.labeled', async context => {
    const app = await getSupport(context);
    if (app) {
      await app.labeled();
    }
  });

  robot.on('issues.unlabeled', async context => {
    const app = await getSupport(context);
    if (app) {
      await app.unlabeled();
    }
  });

  robot.on('issues.reopened', async context => {
    const app = await getSupport(context);
    if (app) {
      await app.reopened();
    }
  });

  async function getSupport(context) {
    const config = await getConfig(context);
    if (config) {
      return new Support(context, config, robot.log);
    }
  }

  async function getConfig(context) {
    const {owner, repo} = context.issue();
    let config;
    try {
      let repoConfig = await context.config('support.yml');
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
