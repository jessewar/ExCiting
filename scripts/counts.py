import sys

def main():
	for line in sys.stdin:
		paper, _, count = line.partition('\t')
		if int(count) >= 100:
			print(paper.rstrip())


if __name__ == '__main__':
	main()