const Support = require('./support');

module.exports = robot => {
  robot.on('issues.labeled', async context => {
    const app = await getSupport(context);
    await app.labeled();
  });

  robot.on('issues.unlabeled', async context => {
    const app = await getSupport(context);
    await app.unlabeled();
  });

  robot.on('issues.reopened', async context => {
    const app = await getSupport(context);
    await app.reopened();
  });

  async function getSupport(context) {
    let config = await context.config('support.yml');
    if (!config) {
      config = {perform: false};
    }

    return new Support(context, config, robot.log);
  }
};
