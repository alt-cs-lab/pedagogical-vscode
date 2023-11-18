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
