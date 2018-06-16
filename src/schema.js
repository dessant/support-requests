const Joi = require('joi');

const schema = Joi.object().keys({
  supportLabel: Joi.string()
    .default('support')
    .description('Label used to mark issues as support requests'),

  supportComment: Joi.alternatives()
    .try(Joi.string(), Joi.boolean().only(false))
    .error(() => '"supportComment" must be a string or false')
    .default(
      ':wave: @{issue-author}, we use the issue tracker exclusively ' +
        'for bug reports and feature requests. However, this issue appears ' +
        'to be a support request. Please use our support channels ' +
        'to get help with the project.'
    )
    .description(
      'Comment to post on issues marked as support requests, ' +
        '`{issue-author}` is an optional placeholder. ' +
        'Set to `false` to disable'
    ),

  close: Joi.boolean()
    .default(true)
    .description('Close issues marked as support requests'),

  lock: Joi.boolean()
    .default(false)
    .description('Lock issues marked as support requests'),

  perform: Joi.boolean().default(!process.env.DRY_RUN)
});

module.exports = schema;
