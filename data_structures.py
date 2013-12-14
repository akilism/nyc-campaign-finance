__author__ = 'akil.harris'

import random
import math

class Node:

    def __init__(self, item, link):
        self.item = item
        self.link = link


class Stack:

    def __init__(self):
        self.node = None
        self.size = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.node is None:
            raise StopIteration
        else:
            item = self.node.item
            self.node = self.node.link
            self.size -= 1
            return item

    def __sizeof__(self):
        return self.size

    def push(self, item):
        old_node = self.node
        self.node = Node(item, old_node)
        self.size += 1

    def pop(self):
        if self.node is not None:
            item = self.node.item
            self.node = self.node.link
            self.size -= 1
            return item
        else:
            return None

    def is_empty(self):
        return self.node is None


class Queue:

    def __init__(self):
        self.first = None
        self.last = None
        self.size = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.first is None:
            raise StopIteration
        else:
            item = self.first.item
            self.first = self.first.link
            self.size -= 1
            return item

    def enqueue(self, item):
        if self.first is None:
            self.first = Node(item, None)
            self.last = self.first
        else:
            self.last.link = Node(item, None)
            self.last = self.last.link
        self.size += 1

    def dequeue(self):
        if self.first is not None:
            item = self.first.item
            self.first = self.first.link
            self.size -= 1
            return item
        else:
            return None

    def is_empty(self):
        return self.first is None

    def __sizeof__(self):
        return self.size


class Deque:

    def __init__(self):
        self.first = None
        self.last = None
        self.size = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.first is None:
            raise StopIteration
        else:
            item = self.first.item
            self.first = self.first.link
            self.size -= 1
            return item

    def push_left(self, item):
        if self.first is None:
            self.first = Node(item, None)
            self.last = self.first
        else:
            old_first = self.first
            self.first = Node(item, old_first)
        self.size += 1

    def push_right(self, item):
        if self.first is None:
            self.first = Node(item, None)
            self.last = self.first
        else:
            old_last = self.last
            self.last = Node(item, None)
            old_last.link = self.last
        self.size += 1

    def pop_left(self):
        if self.first is not None:
            item = self.first.item
            self.first = self.first.link
            self.size -= 1
            return item
        else:
            return None

    def pop_right(self):
        if self.last is not None:
            item = self.last.item
            self.last = self.last.link
            self.size -= 1
            return item
        else:
            return None


class Bag:

    def __init__(self):
        self.node = None
        self.size = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.node is None:
            raise StopIteration
        else:
            item = self.node.item
            self.node = self.node.link
            self.size -= 1
            return item

    def __sizeof__(self):
        return self.size

    def is_empty(self):
        return self.node is None

    def add(self, item):
        old_node = self.node
        self.node = Node(item, old_node)
        self.size += 1


class UnionFind:

    def __init__(self, size):
        self.id = []
        self.count_components = size

    def union(self, p, q):
        p_id = self.quick_find(p)
        q_id = self.quick_find(q)

        if p_id == q_id:
            return

        x = 0
        while x < len(self.id):
            if self.id[x] == p_id:
                self.id[i] = q_id
            x += 1
        self.count_components -= 1

    def connected(self, p, q):
        return self.find(p) == self.find(q)

    def quick_find(self, p):
        return self.id[p]

    def count(self):
        return self.count_components

    def quick_union(self, p, q):
        p_id = self.find(p)
        q_id = self.find(q)

        if p_id is q_id:
            return

        self.id[p_id] = q_id

        self.count_components -= 1

    def find(self, p):
        while p is not self.id[p]:
            p = self.id[p]
        return p


class WeightedUnionFind:

    def __init__(self, size):
        self.id = []
        self.size = []
        self.count_components = size

    def connected(self, p, q):
        return self.find(p) == self.find(q)

    def count(self):
        return self.count_components

    def union(self, p, q):
        p_id = self.find(p)
        q_id = self.find(q)

        if p_id is q_id:
            return

        if self.size[p_id] < self.size[q_id]:
            self.id[p_id] = q_id
            self.size[q_id] += self.size[p_id]
        else:
            self.id[q_id] = p_id
            self.size[p_id] += self.size[q_id]

        self.count_components -= 1

    def find(self, p):
        while p is not self.id[p]:
            p = self.id[p]
        return p


class QuickSort:

    def __init__(self, items):
        self.items = random.shuffle(items)
        self.sort(self.items, 0, len(self.items)-1)

    def sort(self, items, lo, high):
        if high <= lo:
            return

        mid = self.partition(items, high, lo)
        self.sort(items, lo, mid-1)
        self.sort(items, mid+1, high)

    def exch(self, a, i, j):
        x = a[i]
        a[i] = a[j]
        a[j] = x

    def less(self, i, j):
        return i.compare_to(j) < 0;

    def partition(self, items, high, lo):
        i = lo
        j = high + 1
        partition_element = items[lo]
        while True:
            while self.less(a[i], partition_element):
                i += 1
                if i == high:
                    break
            while self.less(partition_element, a[j]):
                j -= 1
                if j == lo:
                    break
            if i >= j:
                break
            self.exch(a, i, j)

        self.exch(a, lo, j)
        return j


class MinPQ:

    def __init__(self):
        self.items = []

    def insert(self, key):
        self.items.append(key)
        self.swim()

    def less(self, a, b):
        return a.compare_to(b) < 0

    def exch(self, a, b):
        x = self.items[a]
        self.items[a] = self.items[b]
        self.items[b] = x

    def swim(self):
        l = len(self.items)
        while l > 1 and self.less(l/2, l):
            self.exch(l/2, l)
            l = l/2


class BinarySearch:

    def __init__(self):
        self.keys = []
        self.values = []
        self.size = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.is_empty():
            raise StopIteration

        for x in self.keys:
            self.size -= 1
            return x

    def __sizeof__(self):
        return self.size

    def is_empty(self):
        return self.size == 0

    def rank(self, key):
        lo = 0
        hi = self.size - 1

        while lo <= hi:
            mid = math.floor(lo + (hi - lo) / 2)

            if key.compare_to(self.keys[mid]) < 0:
                hi = mid - 1
            elif key.compare_to(self.keys[mid]) > 0:
                lo = mid + 1
            else:
                return mid
        return lo

    def get(self, key):
        if self.is_empty():
            return None

        i = self.rank(key)
        if i < self.size and self.keys[i].compare_to(key) == 0:
            return self.values[i]

        return None

    def put(self, key, value):
        i = self.rank(key)

        if i < self.size and self.keys[i].compare_to(key) == 0:
            self.values[i] = value
            return

        p = self.size
        while p > i:
            self.keys.append(self.keys[p-1])
            self.values.append(self.values[p-1])
            p -= 1

        self.keys.append(key)
        self.values.append(value)
        self.size += 1

    def deleteKey(self, key):
        self.size -= 1

    def min(self):
        return self.keys[0]

    def max(self):
        return self.keys[self.size-1]

    def select(self, i):
        return self.keys[i]

    def ceiling(self, key):
        i = self.rank(key)
        return keys[i]

    def contains(self, key):
        return self.get(key) is not None
