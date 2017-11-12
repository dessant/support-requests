const defaults = require('./defaults');

module.exports = class Support {
  constructor(context, config, logger) {
    this.context = context;
    this.config = Object.assign({}, defaults, config || {});
    this.logger = logger || console;
  }

  hasLabel() {
    const supportLabel = this.config.supportLabel;
    for (const label of this.context.payload.issue.labels) {
      if (label.name === supportLabel) {
        return true;
      }
    }
  }

  labelTouched() {
    return this.context.payload.label.name === this.config.supportLabel;
  }

  issueOpen() {
    return this.context.payload.issue.state === 'open';
  }

  issueLocked() {
    return this.context.payload.issue.locked;
  }

  async labeled() {
    if (!this.labelTouched()) {
      return;
    }
    const {owner, repo, number} = this.context.issue();
    const {perform, supportComment, close, lock} = this.config;

    if (supportComment && !this.issueLocked()) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being commented on`);
        await this.context.github.issues.createComment({
          owner,
          repo,
          number,
          body: supportComment
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been commented on (dry run)`
        );
      }
    }

    if (close && this.issueOpen()) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being closed`);
        await this.context.github.issues.edit({
          owner,
          repo,
          number,
          state: 'closed'
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been closed (dry run)`
        );
      }
    }

    if (lock && !this.issueLocked()) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being locked`);
        await this.context.github.issues.lock({
          owner,
          repo,
          number
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been locked (dry run)`
        );
      }
    }
  }

  async unlabeled() {
    if (!this.labelTouched()) {
      return;
    }
    const {owner, repo, number} = this.context.issue();
    const {perform, close, lock} = this.config;

    if (close && !this.issueOpen()) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being reopened`);
        await this.context.github.issues.edit({
          owner,
          repo,
          number,
          state: 'open'
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been reopened (dry run)`
        );
      }
    }

    if (lock && this.issueLocked()) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being unlocked`);
        await this.context.github.issues.unlock({
          owner,
          repo,
          number
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been unlocked (dry run)`
        );
      }
    }
  }

  async reopened() {
    if (!this.hasLabel()) {
      return;
    }
    const {owner, repo, number} = this.context.issue();
    const {perform, supportLabel, close, lock} = this.config;

    if (close) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being unlabeled`);
        await this.context.github.issues.removeLabel({
          owner,
          repo,
          number,
          name: supportLabel
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been unlabeled (dry run)`
        );
      }
    }

    if (lock && this.issueLocked()) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being unlocked`);
        await this.context.github.issues.unlock({
          owner,
          repo,
          number
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been unlocked (dry run)`
        );
      }
    }
  }
};
