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
- The nodes are recreated after each step. All nodes are animated, which makes it difficult to know which nodes changed.
- The value of the `args` string array ends in `@8`. I wonder what that's for? *(foreshadowing...)*

> The ordering of the nodes is also wierd, but that's partially because layouting in Pedagogical is still a work-in-progress.

## Step 2: Analyzing the session state

Pedagogical stores the debug adapter objects in the Redux state. Let's view it in Redux Devtools to see if we can understand what's going on. If the devtools window looks empty, press Ctrl+R to refresh it. After expanding some objects, it should look something like this:
![Redux Devtools window](img/adding-debugger-devtools.png)

Make sure you have "State" selected on the right. This is subject to change, but right now the `id`, `name` and `type` of each session is stored under `sessionEntities`, and each debug session's state (including all the debug objects) is stored in `sessionStates`.

Here's what our session entity looks like:

```json
{
    "id": "05b87bf2-cdac-40f6-9d31-2f9292109499",
    "name": "LinkedList",
    "type": "java"
}
```

Pretty straightforward. The `id` corresponds to the debug session's id given by vscode. We can see the debug adapter type is simply `"java"`, which we will need later.

(TODO: dive in to session state)
