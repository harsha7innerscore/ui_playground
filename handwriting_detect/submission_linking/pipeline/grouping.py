"""Collapse linked student-pairs into groups (../README.md output rule #2:
"If A-C, A-B and B-C all link, that is one group of three, not three findings.")
"""


class UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, x):
        self.parent.setdefault(x, x)
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def group_links(links):
    """links: list of dicts with 'student_a' and 'student_b'. Returns groups of
    student ids (sets), one per connected component."""
    uf = UnionFind()
    for link in links:
        uf.union(link["student_a"], link["student_b"])

    groups = {}
    for link in links:
        for student in (link["student_a"], link["student_b"]):
            root = uf.find(student)
            groups.setdefault(root, set()).add(student)

    return list(groups.values())
