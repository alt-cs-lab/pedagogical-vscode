# Adding Debugger Support to Pedagogical

TODO: finish

> NOTE: Pedagogical is in early development and some of this information is subject to change, but the general structure of debug sessions should stay the same.

The debug adapter provides a common interface debug different languages in vscode. However, this does not mean that all debug adapters function the exact same way or provide the same information (see [Debug Adapter Protocol](./debug-adapter-protocol.md)). Because of this, a debug adapter session must be implemented in Pedagogical for it to work correctly.

See [Pedagogical Sessions](./pedagogical-sessions.md) for info on how Pedagogical handles debug sessions. Basically, a debug adapter type should implement the `DefaultSession` class (for small changes to the default way that Pedagogical handles debug session), or the `BaseSession` class (if for some reason you want to support something completely different from a standard debug adapter).

In this document, we will try adding support for debugging Java files using [Microsoft's Debugger for Java extension](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug).

## Step 1: Testing with `DefaultSession`

If Pedagogical is not configured to support a certain debug adapter, it will fall back to using the `DefaultSession`. Since our session type will most likely be based on `DefaultSession`, let's test it out to see how well it works.

First, let's run `yarn redux-devtools` so we can see all the debug objects in the Redux state, then let's run the extension.

I'm going to debug this Java file that demonstrates a basic implementation of a linked list:

```java
// LinkedList.java
class LinkedList {
    public static void main(String[] args) {
        Node nodeA = new Node(10);

        Node nodeB = new Node(20);
        nodeA.next = nodeB;

        Node nodeC = new Node(30);
        nodeB.next = nodeC;
    }
}

class Node {
    Node next;
    int value;

    public Node(int value) {
        this.value = value;
    }
}
```

Here's what Pedagogical looks like while debugging this file:
![Gif of Pedagogical while debugging LinkedList.java](img/adding-debugger-linked-list.gif)
![Pedagogical while debugging LinkedList.java, halfway down the main function](img/adding-debugger-linked-list.png)

That's not too far off what we're looking for! There are a few things to note here:

- `nodeA.next` is supposed to point the `nodeB` object. Instead, it's pointing to a new object.
- After each step, all nodes slide in from the top-left. This is because each node is being recreated for each step, rather than reusing nodes from the previous step.
- The value of the `args` string array ends in `@8`. I wonder what that's for? *(foreshadowing...)*

> The ordering of the nodes is also weird, but that's partially because layouting in Pedagogical is still a work-in-progress, so let's not worry about that right now.

## Step 2: Analyzing the session state

Pedagogical stores the debug adapter objects in the Redux state. Let's view it in Redux Devtools to see if we can understand what's going on. If the devtools window looks empty, press Ctrl+R to refresh it. Make sure you have the State tab selected near the top-right. After expanding some slices in the tree, it should look something like this:
![Redux Devtools window](img/adding-debugger-devtools.png)

This is subject to change, but right now the `id`, `name` and `type` of each session is stored under `sessionEntities`, and each debug session's state (including all the debug objects) is stored in `sessionStates`.

Here's what our session entity looks like:

```js
"357673b0-003f-4dda-b21a-5931298b3c04": {
  id: "357673b0-003f-4dda-b21a-5931298b3c04",
  name: "LinkedList",
  type: "java",
}
```

Pretty straightforward. The `id` corresponds to the debug session's id given by vscode. We can see the debug adapter type is simply `"java"`, which we will need later.

Okay, now let's look at the actual state of the session. Here's what mine looks like:

```js
"357673b0-003f-4dda-b21a-5931298b3c04": {
  name: "LinkedList",
  threads: { ids: [...], entities: {...} },
  stackFrames: { ids: [...], entities: {...} },
  scopes: { ids: [...], entities: {...} },
  variables: { ids: [...], entities: {...} },
  nodes: { ids: [...], entities: {...} },
  edges: { ids: [...], entities: {...} },
  lastPause: 1697732676996,
  lastFetch: 1697732676998,
  loading: false,
  id: "357673b0-003f-4dda-b21a-5931298b3c04",
  type: "java"
}
```

I won't go through all of them, but here are the important properties:

- `name`, `id`, and `type` are the same as the session entity from above.
- `threads`, `stackFrames`, `scopes`, and `variables` are objects gathered from the debug adapter.
- `nodes` and `edges` are objects displayed in the flowchart.

## Step 3: Finding the source of issues

Now that we can see the session state, let's see if we can track down the cause of the issues.

### Issue 1: Equal reference variables do not point to the same node

In this example, `nodeA.next` should point to `nodeB`. Instead, it's pointing to a new node. Why is this happening?

![nodeA.next should point to nodeB, but it instead points to a new node](img/adding-debugger-wrong-reference-node.png)

Debug symbols are in the hierarchy `threads -> stackFrames -> scopes -> variables`. If you step through those symbols in the session state, you'll eventually come across this variable entity (shortened a bit to save space):

```js
variables: {
  ids: ['11', '12', '14', '13'],
  entities: {
    '11': {
      pedagogId: '11',
      variablesReference: 11,
      variables: [
        {
          name: 'args',
          value: 'String[0]@8',
          variablesReference: 0,
          /* ... */
        },
        {
          name: 'nodeA',
          value: 'Node@10',
          variablesReference: 12, // nodeA points to 12
          /* ... */
        },
        {
          name: 'nodeB',
          value: 'Node@13',
          variablesReference: 13, // nodeB points to 13
          /* ... */
        }
      ]
    }
    /* ... */
  }
}
```

This is the `variables` entity that belongs to the local scope in the stack frame. Each variable has a `name`, `value`, and `variablesReference`. If a variable has a `variableReference` number, that means there's a nested value that can be fetched by sending a request with the reference number to the debug adapter. For example, if you expand the `nodeA` entry in the debug panel, then it will send a [variables request](https://microsoft.github.io/debug-adapter-protocol/specification#Requests_Variables) with `variablesReference: 12` to the debug adapter to get the nested variable info. The reference number 0 means there's no nested information, hence why you can't expand the `args` entry.

It looks like `nodeA` points to the reference number 12, and nodeB points to 13. The code assigns `nodeA.next = nodeB`, so if we look at the `nodeA` referenced variable in the state, then we should expect `next` to have `variablesReference: 13` since it's equal to `nodeB`, right?

```js
'12': {
  pedagogId: '12',
  variablesReference: 12,
  variables: [
    {
      name: 'next',
      value: 'Node@13',
      variablesReference: 14, // nodeA.next points to 14
    },
    {
      name: 'value',
      value: '10',
      variablesReference: 0,
    }
  ]
},
'13': {
  pedagogId: '13',
  variablesReference: 13,
  variables: [
    {
      name: 'next',
      value: 'null',
      variablesReference: 0,
    },
    {
      name: 'value',
      value: '20',
      variablesReference: 0,
    }
  ]
},
'14': {
  pedagogId: '14',
  variablesReference: 14,
  variables: [
    {
      name: 'next',
      value: 'null',
      variablesReference: 0,
    },
    {
      name: 'value',
      value: '20',
      variablesReference: 0,
    }
  ]
}
```

Instead, it points to 14. If we compare the variables with references 13 and 14 in the state, we see they are identical. If `nodeA.next` and `nodeB` reference the same object, then why don't they have the same reference number? Because they don't have to! The `variablesReference` numbers only exist so the debug extension can request variables after a tree item is expanded in the panel. It doesn't matter if two variables reference the same object; that object will appear twice in the debug panel anyway.

Instead, **we need to find some other value we can use to determine if two objects are the same**. For the Java debugger, this is easy! If we compare the above states for `nodeA.next` and `nodeB`, we see they both have the value `Node@13` (you can also see this in the debug panel). That 13 acts as a unique identifier for the object, so you can see if two variables reference the same object.

Pedagogical uses the `pedagogId` property to uniquely identify variables, and is equal to the `variablesReference` by default. So, our solution is **if we fetch an object for a reference variable, then we should set that object's `pedagogId` to the value of the reference variable** (in this case `"Node@10"` and `"Node@13"`).

For other language debuggers, you'll need to find some other way to uniquely ID objects if the variablesReference isn't good enough. Some debug adapters include a `memoryReference` you could use. If the debug adapter doesn't give you anything you could use as an ID, you might be able to [evaluate](https://microsoft.github.io/debug-adapter-protocol/specification#Requests_Evaluate) some command in the debugger. For example, Python has a built-in `id()` function that returns a unique ID for an object.

### Issue 2: Nodes slide in from the top-left after each debug step

Since Pedagogical uses `pedagogId` to uniquely identify variables, it also uses that to identify nodes. After each step, if we fetch a variable that has the same ID as an existing node, then it will update that node. Otherwise, it will create a new one. Bearing that in mind, let's look at those `pedagogId`s again to see if we notice anything strange.

If you keep the variables state open while stepping through the code, you may have noticed something: the IDs change after every step!

![ids change after every step](img/adding-debugger-changing-references.gif)

`variablesReference` strikes again! [The protocol states that object references are only good for the current paused state.](https://microsoft.github.io/debug-adapter-protocol/overview#lifetime-of-objects-references) As soon as the debugger continues, those references can be thrown away. This is because managing references can become complicated for the debug adapter.

Our solution is to determine some other unique ID that will remain constant throughout the debug session -- which we are conveniently already doing to solve the previous issue!

