module.exports = {
  perform: !process.env.DRY_RUN,
  supportLabel: 'support',
  supportComment:
    '👋 We use the issue tracker exclusively for bug reports ' +
    'and feature requests. However, this issue appears to be a support ' +
    'request. Please use our support channels to get help with the project.',
  close: true,
  lock: false
};
