import core from '@actions/core';
import github from '@actions/github';

import {getConfig, getClient} from './utils.js';

async function run() {
  try {
    const config = getConfig();
    const client = getClient(config['github-token']);

    const app = new App(config, client);
    if (github.context.payload.action === 'labeled') {
      await app.labeled();
    } else if (github.context.payload.action === 'unlabeled') {
      await app.unlabeled();
    } else if (github.context.payload.action === 'reopened') {
      await app.reopened();
    }
  } catch (err) {
    core.setFailed(err);
  }
}

class App {
  constructor(config, client) {
    this.config = config;
    this.client = client;
  }

  async labeled() {
    if (github.context.payload.label.name !== this.config['support-label']) {
      return;
    }

    const issueData = github.context.payload.issue;
    const issue = {...github.context.repo, issue_number: issueData.number};

    const comment = this.config['issue-comment'];
    if (comment) {
      core.debug(`Commenting (issue: ${issue.issue_number})`);

      const commentBody = comment.replace(
        /{issue-author}/,
        issueData.user.login
      );
      await this.ensureUnlock(
        issue,
        {
          active: issueData.locked,
          reason: issueData.active_lock_reason,
          restoreLock: !this.config['lock-issue']
        },
        () =>
          this.client.rest.issues
            .createComment({...issue, body: commentBody})
            .catch(err => core.warning(err.toString()))
      );
    }

    const closeReason = this.config['issue-close-reason'];
    if (
      this.config['close-issue'] &&
      (issueData.state === 'open' || issueData.state_reason !== closeReason)
    ) {
      core.debug(`Closing (issue: ${issue.issue_number})`);

      await this.client.rest.issues.update({
        ...issue,
        state: 'closed',
        state_reason: closeReason
      });
    }

    const lockReason = this.config['issue-lock-reason'] || null;
    if (
      this.config['lock-issue'] &&
      (!issueData.locked || issueData.active_lock_reason !== lockReason)
    ) {
      core.debug(`Locking (issue: ${issue.issue_number})`);

      const params = {...issue};

      if (lockReason) {
        params.lock_reason = lockReason;
      }

      // Lock reason is not updated when issue is locked
      // Issue is unlocked before posting comment
      if (issueData.active_lock_reason !== lockReason && !comment) {
        await this.client.rest.issues.unlock(issue);
      }

      await this.client.rest.issues.lock(params);
    }
  }

  async unlabeled() {
    if (github.context.payload.label.name !== this.config['support-label']) {
      return;
    }

    const issueData = github.context.payload.issue;
    const issue = {...github.context.repo, issue_number: issueData.number};

    if (this.config['close-issue'] && issueData.state === 'closed') {
      core.debug(`Reopening (issue: ${issue.issue_number})`);

      await this.client.rest.issues.update({...issue, state: 'open'});
    }

    if (this.config['lock-issue'] && issueData.locked) {
      core.debug(`Unlocking (issue: ${issue.issue_number})`);

      await this.client.rest.issues.unlock(issue);
    }
  }

  async reopened() {
    const issueData = github.context.payload.issue;
    const supportLabel = this.config['support-label'];

    if (!issueData.labels.map(label => label.name).includes(supportLabel)) {
      return;
    }

    const issue = {...github.context.repo, issue_number: issueData.number};

    core.debug(`Unlabeling (issue: ${issue.issue_number})`);

    await this.client.rest.issues.removeLabel({...issue, name: supportLabel});

    if (this.config['lock-issue'] && issueData.locked) {
      core.debug(`Unlocking (issue: ${issue.issue_number})`);

      await this.client.rest.issues.unlock(issue);
    }
  }

  async ensureUnlock(issue, lock, action) {
    if (lock.active) {
      if (!lock.hasOwnProperty('reason')) {
        const {data: issueData} = await this.client.rest.issues.get(issue);
        lock.reason = issueData.active_lock_reason;
      }

      await this.client.rest.issues.unlock(issue);

      let actionError;
      try {
        await action();
      } catch (err) {
        actionError = err;
      }

      if (lock.restoreLock) {
        if (lock.reason) {
          issue = {...issue, lock_reason: lock.reason};
        }

        await this.client.rest.issues.lock(issue);
      }

      if (actionError) {
        throw actionError;
      }
    } else {
      await action();
    }
  }
}

run();
