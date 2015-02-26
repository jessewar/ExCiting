"""
Get all the papers!
"""

import sys

def main():
	"""main"""

	if len(sys.argv) != 4:
		print("""
			usage: 
			python3 
			extract_papers_threshold.py 
			paper_list 
			cite_map 
			output_file
			""")
		sys.exit(1)

	paper_list = sys.argv[1]
	cite_map = sys.argv[2]
	output_file = sys.argv[3]

	input_papers = set()
	output_papers = set()

	with open(paper_list, 'r') as file:
		for line in file:
			input_papers.add(line.rstrip())

	with open(cite_map, 'r') as file:
		for line in file:
        # lines are in the format A00-1234 ==> B55-6789
			citer, _, paper = line.rstrip().partition(' ==> ')
			if paper in input_papers:
				output_papers.add(citer)
	
	with open(output_file, 'w') as file:
		for paper in output_papers:
			file.write(paper + '\n')


if __name__ == '__main__':
	main()