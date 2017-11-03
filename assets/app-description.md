A GitHub App that comments on and closes issues labeled as support requests.

![](https://i.imgur.com/D1w1958.png)

## Usage

After installing the app, create `.github/support.yml` in the default branch to enable it:

```yml
# Configuration for support-requests - https://github.com/dessant/support-requests

# Label used to mark issues as support requests
supportLabel: support
# Comment to post on issues marked as support requests. Add a link
# to a support page, or set to `false` to disable
supportComment: >
  We use the issue tracker exclusively for bug reports and feature requests.
  However, this issue appears to be a support request. Please use our
  support channels to get help with the project.
# Whether to close issues marked as support requests
close: true
# Whether to lock issues marked as support requests
lock: false
```
