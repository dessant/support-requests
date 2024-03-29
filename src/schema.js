import Joi from 'joi';

const extendedJoi = Joi.extend(joi => {
  return {
    type: 'closeReason',
    base: joi.string(),
    coerce: {
      from: 'string',
      method(value, helpers) {
        value = value.trim();
        if (value === 'not planned') {
          value = 'not_planned';
        }

        return {value};
      }
    }
  };
});

const schema = Joi.object({
  'github-token': Joi.string().trim().max(100),

  'support-label': Joi.string().trim().max(50).default('support'),

  'issue-comment': Joi.string()
    .trim()
    .max(10000)
    .allow('')
    .default(
      ':wave: @{issue-author}, we use the issue tracker exclusively ' +
        'for bug reports and feature requests. However, this issue appears ' +
        'to be a support request. Please use our support channels ' +
        'to get help with the project.'
    ),

  'close-issue': Joi.boolean().default(true),

  'issue-close-reason': extendedJoi
    .closeReason()
    .valid('completed', 'not_planned')
    .default('not planned'),

  'lock-issue': Joi.boolean().default(true),

  'issue-lock-reason': Joi.string()
    .valid('resolved', 'off-topic', 'too heated', 'spam', '')
    .default('off-topic')
});

export {schema};
