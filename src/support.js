module.exports = class Support {
  constructor(context, config, logger) {
    this.context = context;
    this.config = config;
    this.log = logger;
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

  getLogMessage(message) {
    if (!this.config.perform) {
      message += ' (dry run)';
    }
    return message;
  }

  async labeled() {
    if (!this.supportLabelTouched) {
      return;
    }

    const {payload, github} = this.context;
    const issue = this.context.issue();
    const {owner, repo} = issue;
    const {perform, supportComment, close, lock} = this.config;

    if (supportComment && !this.issueLocked) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Commenting')
      );
      if (perform) {
        const commentBody = supportComment.replace(
          /{issue-author}/,
          payload.issue.user.login
        );
        await github.issues.createComment({
          ...issue,
          body: commentBody
        });
      }
    }

    if (close && this.issueOpen) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Closing')
      );
      if (perform) {
        await github.issues.edit({
          ...issue,
          state: 'closed'
        });
      }
    }

    if (lock && !this.issueLocked) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Locking')
      );
      if (perform) {
        await github.issues.lock(issue);
      }
    }
  }

  async unlabeled() {
    if (!this.supportLabelTouched) {
      return;
    }

    const github = this.context.github;
    const issue = this.context.issue();
    const {owner, repo} = issue;
    const {perform, close, lock} = this.config;

    if (close && !this.issueOpen) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Opening')
      );
      if (perform) {
        await github.issues.edit({
          ...issue,
          state: 'open'
        });
      }
    }

    if (lock && this.issueLocked) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Unlocking')
      );
      if (perform) {
        await github.issues.unlock(issue);
      }
    }
  }

  async reopened() {
    if (!this.hasSupportLabel) {
      return;
    }

    const github = this.context.github;
    const issue = this.context.issue();
    const {owner, repo} = issue;
    const {perform, supportLabel, close, lock} = this.config;

    if (close) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Unlabeling')
      );
      if (perform) {
        await github.issues.removeLabel({
          ...issue,
          name: supportLabel
        });
      }
    }

    if (lock && this.issueLocked) {
      this.log.info(
        {owner, repo, issue: issue.number},
        this.getLogMessage('Unlocking')
      );
      if (perform) {
        await github.issues.unlock(issue);
      }
    }
  }
};
