"""
Extract papers written by UW faculty in our subset of papers.
"""

import sys
import re

def main():
	"""
	main.
	"""

	if len(sys.argv) != 3:
		print("""usage: 
			python3 
			uw_papers.py 
			acl-metadata-location
			papers_above_threshold""")

	acl_metadata = sys.argv[1]
	papers_above_threshold = sys.argv[2]

	uw_papers = set()
	uw_authors = ['Domingos, Pedro', 'Weld, Dan', 'Zettlemoyer, Luke',
		'Etzioni, Oren', 'Choi, Yejin']
	threshold_papers = set()

	id_re = '^id = {(.*)}$'				# matches the paper id field
	author_re = '^author = {(.*)}$'		# matches the author field

	# process acl-metadata.txt
	with open(acl_metadata, 'r') as input_file:
		paper_id = None

		while True:
			try:
				line = input_file.readline()
				if (line == ''):
					break
				elif re.search(id_re, line):
					paper_id = re.search(id_re, line).group(1).strip()
				elif re.search(author_re, line):
					authors = re.search(author_re, line).group(1)
					authors = [auth.strip() for auth in authors.split(';')]
					for auth in uw_authors:
						if auth in authors:
							uw_papers.add(paper_id)
			except:
				# to handle Unicode Decoding Errors
				continue

	# process papers_above_threshold.txt
	with open(papers_above_threshold, 'r') as input_file:
		for paper in input_file:
			threshold_papers.add(paper.strip())

	# nifty set intersection
	for paper in uw_papers & threshold_papers:
		print(paper)

if __name__ == '__main__':
	main()