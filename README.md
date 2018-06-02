# Simple Templating

This small library provides minimal templating options for javascrpt in browsers.

| Type | Status |
| --- | --- |
| Build | [![Build Status](https://travis-ci.org/Idrinth/simple-templating.svg?branch=master)](https://travis-ci.org/Idrinth/simple-templating) |
| Coverage | [![Test Coverage](https://api.codeclimate.com/v1/badges/36da5f7441f95e94b8bd/test_coverage)](https://codeclimate.com/github/Idrinth/simple-templating/test_coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/5f96fa1a257948598e2d964f2979648a)](https://www.codacy.com/app/Idrinth/simple-templating?utm_source=github.com&utm_medium=referral&utm_content=Idrinth/simple-templating&utm_campaign=Badge_Coverage) |
| Quality | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/5f96fa1a257948598e2d964f2979648a)](https://www.codacy.com/app/Idrinth/simple-templating?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Idrinth/simple-templating&amp;utm_campaign=Badge_Grade) |
| Maintainability | [![Maintainability](https://api.codeclimate.com/v1/badges/36da5f7441f95e94b8bd/maintainability)](https://codeclimate.com/github/Idrinth/simple-templating/maintainability) |

## Values

assume the following values: `{key: 'value', keys:{key:2}`

`{{key}}` will be replaced by `value`
`{{keys.key}}` will be replaced by `2`

## Logic

logic blocks may contain other logic blocks.

### IF

`{{%if check%}}This shows if the boolean value of check is true.{{%end%}}`
`{{%if !check%}}This shows if the boolean value of check is false.{{%end%}}`

This does not support more than one variable and does not support chaining for the time being. You can invert the check by adding an exclamation mark in front of the condition tho.

### EACH

`{{%each list%}}- {{list_key}}: {{list_value}}{{%end%}}`

Each iterates over Objects and Arrays, exposing the following variables within the loop:

- list_key: the position in case of an array or the property name in case of other objects
- list_pos: the position integer in the list, equal to list_key in the case of arrays
- list_value: the value of the current item
- list_even: a boolean, useful for conditions

The names of those variables are build from the parent variable name(list in this case) and appending _key, _pos, _value and _even respectively.