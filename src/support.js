module.exports = class Support {
  constructor(context, config, logger) {
    this.context = context;
    this.config = config;
    this.logger = logger;
  }

  get hasSupportLabel() {
    const supportLabel = this.config.supportLabel;
    for (const label of this.context.payload.issue.labels) {
      if (label.name === supportLabel) {
        return true;
      }
    }
  }

  get supportLabelTouched() {
    return this.context.payload.label.name === this.config.supportLabel;
  }

  get issueOpen() {
    return this.context.payload.issue.state === 'open';
  }

  get issueLocked() {
    return this.context.payload.issue.locked;
  }

  async labeled() {
    if (!this.supportLabelTouched) {
      return;
    }

    const {payload, github} = this.context;
    const {owner, repo, number} = this.context.issue();
    const {perform, supportComment, close, lock} = this.config;

    if (supportComment && !this.issueLocked) {
      const commentBody = supportComment.replace(
        /{issue-author}/,
        payload.issue.user.login
      );
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being commented on`);
        await github.issues.createComment({
          owner,
          repo,
          number,
          body: commentBody
        });
      } else {
        this.logger.info(
          `${owner}/${repo}#${number} would have been commented on (dry run)`
        );
      }
    }

    if (close && this.issueOpen) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being closed`);
        await github.issues.edit({
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

    if (lock && !this.issueLocked) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being locked`);
        await github.issues.lock({
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
    if (!this.supportLabelTouched) {
      return;
    }

    const github = this.context.github;
    const {owner, repo, number} = this.context.issue();
    const {perform, close, lock} = this.config;

    if (close && !this.issueOpen) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being reopened`);
        await github.issues.edit({
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

    if (lock && this.issueLocked) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being unlocked`);
        await github.issues.unlock({
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
    if (!this.hasSupportLabel) {
      return;
    }

    const github = this.context.github;
    const {owner, repo, number} = this.context.issue();
    const {perform, supportLabel, close, lock} = this.config;

    if (close) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being unlabeled`);
        await github.issues.removeLabel({
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

    if (lock && this.issueLocked) {
      if (perform) {
        this.logger.info(`${owner}/${repo}#${number} is being unlocked`);
        await github.issues.unlock({
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
