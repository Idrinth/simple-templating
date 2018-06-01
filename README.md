# Simple Templating

This small library provides minimal templating options:

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