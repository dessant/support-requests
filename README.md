# Support Requests

[![npm](https://img.shields.io/npm/v/support-requests.svg?style=flat-square&colorB=007EC6)](https://www.npmjs.com/package/support-requests)

Support Requests is a GitHub App built with [Probot](https://github.com/probot/probot)
that comments on and closes issues labeled as support requests.

![](assets/screenshot.png)

## Supporting the Project

The continued development of Support Requests is made possible
thanks to the support of awesome backers. If you'd like to join them,
please consider contributing with [Patreon](https://goo.gl/qRhKSW),
[PayPal](https://goo.gl/5FnBaw) or [Bitcoin](https://goo.gl/uJUAaU).

## Usage

1. **[Install the GitHub App](https://github.com/apps/support)**
   for the intended repositories
2. Create `.github/support.yml` based on the template below
3. Start labeling issues as support requests

#### Configuration

Create `.github/support.yml` in the default branch to enable the app.
The file can be empty, or it can override any of these default settings:

```yaml
# Configuration for support-requests - https://github.com/dessant/support-requests

# Label used to mark issues as support requests
supportLabel: support

# Comment to post on issues marked as support requests, `{issue-author}` is an
# optional placeholder. Set to `false` to disable
supportComment: >
  :wave: @{issue-author}, we use the issue tracker exclusively for bug reports
  and feature requests. However, this issue appears to be a support request.
  Please use our support channels to get help with the project.

# Close issues marked as support requests
close: true

# Lock issues marked as support requests
lock: false

# Assign `off-topic` as the reason for locking. Set to `false` to disable
setLockReason: true

# Repository to extend settings from
# _extends: repo
```

## Deployment

See [docs/deploy.md](docs/deploy.md) if you would like to run your own
instance of this app.

## License

Support Requests is released under the terms of the MIT License.
Please refer to the LICENSE file.
