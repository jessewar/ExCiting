"""
Generates a mapping from paper ID to a list of of papers that cite it within the ACL corpus.
These results are in the form {paper_id : [(paper_id, paper_title), ...], ...}.
Implicitly this involves:

1. Parsing acl.txt. acl.txt is a list of line-seperated mappings of the form
paperID ==> paperID where the paper on the left of the mapping cites the paper
on the right of the mapping. Thus if we group by the paper ID of the paper
on the right we can get all the paperIDs of papers that cite it.

2. Given this list of papers, we can use paper_ids.txt to get the names of
each of these papers. paper_ids.txt is a list of line-separated mappings
of the form paperID title pub_date. So we simply can lookup the paperID to
get its name from this map.
"""

import sys
import io

def main():
    """main"""

    if len(sys.argv) != 3:
        print("usage: python3 map_paperid_titles.py cite_map name_map")
        sys.exit(1)

    cite_map_path = sys.argv[1]
    name_map_path = sys.argv[2]

    papers = paperid_to_citing_papers(cite_map_path, name_map_path)
   

    # for now we just print the result
    for paper in papers:
        print(paper, papers[paper])


def paperid_to_citing_papers(cite_map_path, name_map_path):
    # maps paperID -> title
    titles = {}

    name_map = None

    try:
        name_map = open(name_map_path)
    except OSError:
        print("invalid name_map")
        sys.exit(1)

    for line in name_map:
        # lines are in the format A00-1234 Title Text Incl 2000
        titles[line[:8]] = line[9:len(line)-5].rstrip()

    # maps paperID -> list of names of papers that cite it
    papers = {}

    cite_map = None

    try:
        cite_map = open(cite_map_path)
    except OSError:
        print("invalid cite_map")
        sys.exit(1)

    for line in cite_map:
        # lines are in the format A00-1234 ==> B55-6789
        citer, _, paper = line.rstrip().partition(' ==> ')
        if paper not in papers:
            papers[paper] = list()

        papers[paper].append((citer, titles[citer]))

    cite_map.close()

    return papers


if __name__ == '__main__':
    main()
