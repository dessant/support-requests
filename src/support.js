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
    const label = this.context.payload.label;
    return label && label.name === this.config.supportLabel;
  }

  get issueOpen() {
    return this.context.payload.issue.state === 'open';
  }

  get issueLocked() {
    return this.context.payload.issue.locked;
  }

  async ensureUnlock(issue, lock, action) {
    if (lock.active) {
      if (!lock.hasOwnProperty('reason')) {
        const {data: issueData} = await this.context.github.issues.get({
          ...issue,
          headers: {
            Accept: 'application/vnd.github.sailor-v-preview+json'
          }
        });
        lock.reason = issueData.active_lock_reason;
      }
      await this.context.github.issues.unlock(issue);
      await action();
      if (lock.reason) {
        issue = {
          ...issue,
          lock_reason: lock.reason,
          headers: {
            Accept: 'application/vnd.github.sailor-v-preview+json'
          }
        };
      }
      await this.context.github.issues.lock(issue);
    } else {
      await action();
    }
  }

  async labeled() {
    if (!this.supportLabelTouched) {
      return;
    }

    const {payload, github} = this.context;
    const issue = this.context.issue();
    const {perform, supportComment, close, lock} = this.config;
    const meta = {issue, perform};

    if (supportComment) {
      this.log.info(meta, 'Commenting');
      if (perform) {
        const commentBody = supportComment.replace(
          /{issue-author}/,
          payload.issue.user.login
        );
        await this.ensureUnlock(issue, {active: this.issueLocked}, () =>
          github.issues.createComment({...issue, body: commentBody})
        );
      }
    }

    if (close && this.issueOpen) {
      this.log.info(meta, 'Closing');
      if (perform) {
        await github.issues.edit({...issue, state: 'closed'});
      }
    }

    if (lock && !this.issueLocked) {
      this.log.info(meta, 'Locking');
      if (perform) {
        await github.issues.lock({
          ...issue,
          lock_reason: 'off-topic',
          headers: {
            Accept: 'application/vnd.github.sailor-v-preview+json'
          }
        });
      }
    }
  }

  async unlabeled() {
    if (!this.supportLabelTouched) {
      return;
    }

    const github = this.context.github;
    const issue = this.context.issue();
    const {perform, close, lock} = this.config;
    const meta = {issue, perform};

    if (close && !this.issueOpen) {
      this.log.info(meta, 'Opening');
      if (perform) {
        await github.issues.edit({...issue, state: 'open'});
      }
    }

    if (lock && this.issueLocked) {
      this.log.info(meta, 'Unlocking');
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
    const {perform, supportLabel, close, lock} = this.config;
    const meta = {issue, perform};

    if (close) {
      this.log.info(meta, 'Unlabeling');
      if (perform) {
        await github.issues.removeLabel({...issue, name: supportLabel});
      }
    }

    if (lock && this.issueLocked) {
      this.log.info(meta, 'Unlocking');
      if (perform) {
        await github.issues.unlock(issue);
      }
    }
  }
};
