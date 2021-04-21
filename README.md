# Support Requests

Support Requests is a GitHub Action that comments on
and closes issues labeled as support requests.

> The legacy version of this project can be found
[here](https://github.com/dessant/support-requests-app).

![](assets/screenshot.png)

## Supporting the Project

The continued development of Support Requests is made possible
thanks to the support of awesome backers. If you'd like to join them,
please consider contributing with
[Patreon](https://armin.dev/go/patreon?pr=support-requests&src=repo),
[PayPal](https://armin.dev/go/paypal?pr=support-requests&src=repo) or
[Bitcoin](https://armin.dev/go/bitcoin?pr=support-requests&src=repo).

## Description

Support Requests can perform the following actions when an issue
is labeled, unlabeled or reopened:

* The support label is added: leave a comment, close and lock the issue
* The support label is removed: reopen and unlock the issue
* The issue is reopened: remove the support label, unlock the issue

## Usage

Create a workflow file named `support.yml` in the `.github/workflows` directory,
use one of the [example workflows](#examples) to get started.

### Inputs

The action can be configured using [input parameters](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepswith).
All parameters are optional, except `github-token`.

- **`github-token`**
  - GitHub access token, value must be `${{ github.token }}`
  - Optional, defaults to `${{ github.token }}`
- **`support-label`**
  - Label used to mark issues as support requests
  - Optional, defaults to `support`
- **`issue-comment`**
  - Comment to post on issues marked as support requests,
    `{issue-author}` is an optional placeholder
  - Optional, defaults to `:wave: @{issue-author}, we use the issue tracker
    exclusively for bug reports and feature requests. However, this issue
    appears to be a support request. Please use our support channels
    to get help with the project.`
- **`close-issue`**
  - Close issues marked as support requests,
    value must be either `true` or `false`
  - Optional, defaults to `true`
- **`lock-issue`**
  - Lock issues marked as support requests,
    value must be either `true` or `false`
  - Optional, defaults to `false`
- **`issue-lock-reason`**
  - Reason for locking issues, value must be one
    of `resolved`, `off-topic`, `too heated` or `spam`
  - Optional, defaults to `off-topic`

## Examples

The following workflow will comment on and close issues
marked as support requests.

```yaml
name: 'Support requests'

on:
  issues:
    types: [labeled, unlabeled, reopened]

jobs:
  support:
    runs-on: ubuntu-latest
    steps:
      - uses: dessant/support-requests@v2
```

### Available input parameters

This workflow declares all the available input parameters of the action
and their default values. All parameters can be omitted, except `github-token`.

```yaml
name: 'Support requests'

on:
  issues:
    types: [labeled, unlabeled, reopened]

jobs:
  support:
    runs-on: ubuntu-latest
    steps:
      - uses: dessant/support-requests@v2
        with:
          support-label: 'support'
          issue-comment: >
            :wave: @{issue-author}, we use the issue tracker exclusively
            for bug reports and feature requests. However, this issue appears
            to be a support request. Please use our support channels
            to get help with the project.
          close-issue: true
          lock-issue: false
          issue-lock-reason: 'off-topic'
```

## License

Copyright (c) 2017-2021 Armin Sebastian

This software is released under the terms of the MIT License.
See the [LICENSE](LICENSE) file for further information.
