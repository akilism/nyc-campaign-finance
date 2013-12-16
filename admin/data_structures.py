__author__ = 'akil.harris'

import random
import math


class Node:

    def __init__(self, item, link, link_right=None):
        self.item = item
        self.link_left = link
        self.link_right = link_right


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
            self.node = self.node.link_left
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
            self.node = self.node.link_left
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
            self.first = self.first.link_left
            self.size -= 1
            return item

    def enqueue(self, item):
        if self.first is None:
            self.first = Node(item, None)
            self.last = self.first
        else:
            self.last.link_left = Node(item, None)
            self.last = self.last.link_left
        self.size += 1

    def dequeue(self):
        if self.first is not None:
            item = self.first.item
            self.first = self.first.link_left
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
            self.first = self.first.link_left
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
            old_last.link_left = self.last
        self.size += 1

    def pop_left(self):
        if self.first is not None:
            item = self.first.item
            self.first = self.first.link_left
            self.size -= 1
            return item
        else:
            return None

    def pop_right(self):
        if self.last is not None:
            item = self.last.item
            self.last = self.last.link_left
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
            self.node = self.node.link_left
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
        self.items = items
        random.shuffle(self.items)
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
        return i.compare_to(j) < 0

    def partition(self, items, high, lo):
        i = lo
        j = high + 1

        while True:
            i += 1
            while self.less(items[i], items[lo]):
                if i == high:
                    break
                i += 1

            j -= 1
            while self.less(items[lo], items[j]):
                if j == lo:
                    break
                j -= 1

            if i >= j:
                break

            self.exch(items, i, j)

        self.exch(items, lo, j)
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
            l /= 2


def binary_search(search_data, key, hi, lo):

    if len(search_data) == 0:
        return None

    if hi < lo:
        return None

    mid = math.floor((lo + hi) / 2)

    if search_data[mid].compare_to(key) > 0:
        return binary_search(search_data, key, mid-1, lo)
    elif search_data[mid].compare_to(key) < 0:
        return binary_search(search_data, key, hi, mid+1)
    else:
        return search_data[mid]
