import sys

def main():

	with open('majority.txt', 'w') as file:
		for line in sys.stdin:
			paper, _, count = line.partition('\t')
			if int(count) >= 100:
				file.write(paper.rstrip() + '\n');


if __name__ == '__main__':
	main()