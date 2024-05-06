# Rules Engine

> NOTE: This is a recent and incomplete addition to Pedagogical, so the implementation is not final.

Pedagogical uses [json-rules-engine](https://github.com/CacheControl/json-rules-engine) to handle some of its business logic. This is because:

- It is somewhat easier to understand and maintain than plain code.
- It provides a starting point for user-defined rules, so Pedagogical can support other debuggers without changing code.

At this time, rules can be written to determine if debug objects should be processed or ignored. In order to provide the best support for other debuggers, we need rules that can transform the debug objects in Pedagogical.

This page acts as a quick primer into json-rules-engine and explains the workflow that Pedagogical uses. json-rules-engine also has a quick [walkthrough](https://github.com/CacheControl/json-rules-engine/blob/master/docs/walkthrough.md) that you should probably read.

## json-rules-engine introduction

json-rules-engine is, as you might have guessed, a rules engine represented in JSON.

A [rules engine](https://en.wikipedia.org/wiki/Business_rules_engine) is a system that processes a sequence of rules to make a decision. Rules engines are used in the business world where workflows need to change quickly due to seasonal events, changing regulations, and more.

Rules are represented in such a way that they can be changed without needing to understand or update the code, hence why this rules engine uses JSON objects.

## Definitions

These are the concepts that json-rules-engine uses in its design, and how Pedagogical uses them.

### Engine

An [engine](https://github.com/CacheControl/json-rules-engine/blob/master/docs/almanac.md) is the main service of json-rules-engine that executes rules and emits events.

Each engine contains its own rules, events, conditions, operators, and facts. Its usage is pretty straight-forward:

1. Initialize an `Engine` with a list of rules.
2. Add/remove rules, facts, operators, etc. as needed.
3. Use `await engine.run()` to start the engine.
4. Wait for the engine to finish or use `engine.stop()` to stop early.
5. Process the successful/failed events returned in the `engine.run()` promise.
6. Repeat steps 2-6 as needed.

In Pedagogical, each debug session has an engine for the four types of debug symbols (threads, stack frames, scopes, and variables). Each engine is initialized with different rules depending on the debugger used (e.g. `debugpy` sessions have rules specific to debugging python programs).

When Pedagogical retreives a debug symbol from the debug adapter, it runs the engine to determine if it should continue processing it.

Here's some simplified pseudocode to demonstrate the process:

```plain
threads <- getThreads()
for thread in threads:
  threadEngine.run(thread)
  if thread is accepted:
    add thread to state
    stackTrace <- getStackTrace(thread)
    for stackFrame in stackTrace:
      stackFrameEngine.run(thread, stackFrame)
      if stackFrame is accepted:
        add stackFrame to state
        scopes <- getScopes(stackFrame)
        for scope in scopes:
          (etc.)
```

### Rules

A [rule](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md) contains a condition and an event. If the condition passes, the event is emitted as successful. Otherwise, the event is emitted as failed.

Rules also have a priority, which defines the order that rules are run. Higher-priority rules are run first.

Here's an example rule that Pedagogical uses to determine if a python variable should be visible:

```json
{
  "name": "pythonVariableAcceptRule",
  "event": {
    // The "accept" event will tell Pedagogial to save this object in the session's state.
    // If the condition passes, the object will be saved and processed.
    // If the condition fails, the object will be dropped and ignored.
    "type": "accept"
  },
  // Priority is set to 100 so this runs before other rules.
  "priority": 100,
  "conditions": {
    // All conditions must pass for this rule to be successful.
    // Supported boolean expressions are `all`, `any`, or `not`.
    "all": [
      {
        // The type of this variable should not be an empty string or "module".
        // Empty string means the variable is "special variables" or "function variables", etc.
        // "module" means this is probably an external module that we don't want to traverse.
        "fact": "variable",
        "path": "$.type",
        "operator": "notIn",
        "value": ["", "module"]
      },
      {
        // The variable entry should not be a return value
        "fact": "variable",
        "path": "$.name",
        "operator": "notStartsWith",
        "value": "(return) "
      }
    ]
  }
}
```

### Conditions
A [condition](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#conditions) is an expression that evaluates to true or false. Conditions usually contain a fact, an operator, and a value. They work basically the same way as conditions in code, just expressed in JSON.

For example, the following conditional expression in code:

```js
variable.type !== "module"
```

is represented like this in JSON:

```json
{
  "fact": "variable",
  "path": "$.type", // The `type` property of the `variable` object
  "operator": "notEqual",
  "value": "module"
}
```

You can use `path` to specify a specific property of an object in a condition. You can also use this to filter or slice arrays. These are represented in [json-path](https://goessner.net/articles/JsonPath/) syntax.

Built-in operators include "equal", "notEqual", "lessThan", "greaterThanInclusive", "contains", and more. Pedagogical also defines its own operators for convenience. Some operators support additional params.

### Events

An [event](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#events) contains a `type`, and optional set of `params`, and is emitted as `success` or `failrue`. You can also reference facts in events to make them a bit more dynamic for each object.

Right now the only event that Pedagogical really uses is the `accept` event, which tells Pedagogical to either process or ignore an object depending on if the rule was a success or failure. Future work could include adding events that transform the debug object, such as setting its unique identifier or some other metadata. *This is probably the most important thing to add if we want to use user-defined rules to support other debuggers.*

### Facts
A [fact] is a method or constant registered with the engine prior to runtime and referenced within rule conditions. In other words, facts are basically just variables that you set before processing the rules.

Each engine in Pedagogical has facts defined for that engine's debug symbol type, the parent debug symbols, and possibly some metadata like the recursion depth. Check the interfaces defined at the top of each file in [packages/webview-ui/src/features/rulesEngine/engines/](../packages/webview-ui/src/features/rulesEngine/engines/) folder to see what facts are defined.

### Almanac

An [almanac](https://github.com/CacheControl/json-rules-engine/blob/master/docs/almanac.md) manages facts throughout the engine run cycle. It can cache values and dynamically compute facts during runtime.

You can probably disregard this since Pedagogical uses the default almanac, though a custom almanac can be created if facts need to be computed during runtime.

## User-defined rules

A benefit of using JSON-defined rules is that users can create their own JSON file and define their own rules for the workspace. Custom workspace rules can be defined in `.vscode/pedagogical-rules.{json,jsonc}` (`jsonc` = JSON with comments). Pedagogical will read those rules any time the webview panel is created, so if you're writing custom rules, you can close/reopen the panel to update those rules.

### Schema

Object types are defined in [packages/shared/src/rules](../packages/shared/src/rules), and those rules are used to generate [pedagogical-rules-schema.json](../schemas/pedagogical-rules-schema.json), so you can benefit from type hints and autocompletion when writing custom rules. If you add more types, run `yarn generate-schema` to update the schema.

## API

Here are lists of all the rules, operators, facts and events you can use when defining rules. (Please try to keep this updated!)

### List of rules

Check the files in [packages/extension/src/rules/builtin](../packages/extension/src/rules/builtin) to see all the rules that Pedagogical uses by default. These can be referenced in user-defined rules.

### List of events

TODO: Not all of these are implemented!

- `accept` - If successful, process the object. If failure, drop and ignore the object.
- `stopRules` - If successful, immediately stop processing the rules for this object.
- `setFetchChildren` (variables only) - If successful, set whether or not child variables should be fetched.
  - `value` boolean - Whether or not child variables should be fetched.
- `setPedagogId` (**not implemented yet!!**) - Set the unique identifier of this object (`pedagogId`) to the value specified by the params.

### List of operators

Some of these operators are built-in to json-rules-engine, and others are defined by Pedagogical. [Check the documentation to see which operators are built-in.](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators)

- String and numeric
  - `equal` - fact must equal value (uses strict equality, ===)
  - `notEqual` - fact must not equal value (strict inequality, !==)
- String (facts are converted to strings before evaluating)
  - `matchesRegExp` - fact must match against `RegExp(params.pattern, params.flags)`
  - `notMatchesRegExp` - fact must not match against `RegExp(params.pattern, params.flags)`
  - `startsWith` - fact must start with value
  - `notStartsWith` - fact must not start with value
  - `endsWith` - fact must end with value
  - `notEndsWith` - fact must not end with value
- Numeric
  - `lessThan` - fact must be less than value
  - `lessThanInclusive` - fact must be less than or equal to value
  - `greaterThan` - fact must be greater than value
  - `greaterThanInclusive` - fact must be greater than or equal to value
- Array
  - `in` - fact must be included in value (an array)
  - `notIn` - fact must not be included in value (an array)
  - `contains` - fact (an array) must contain value
  - `doesNotContain` - fact (an array) must not contain value
- Any
  - `defined` - fact must be defined (`fact !== undefined`)
  - `undefined` - fact must be undefined
    - (`value` is ignored for both of these and can be set to `null`)
