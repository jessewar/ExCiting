import sys
import shutil
import os

def main():
  # Edit these lines to match your local filesystem
  paper_list_file = "../../data/papers_citing_threshold_papers.txt"
  output_dir = "../../data/repo-exclude/paper_subset/"
  papers_source_dir = "../../data/repo-exclude/aan/papers_text/"


  #create directory for our files
  if not os.path.exists(output_dir):
    os.makedirs(output_dir)
  if not os.path.exists(output_dir + "raw"):
    os.makedirs(output_dir + "raw")
  if not os.path.exists(output_dir + "chunks"):
    os.makedirs(output_dir + "chunks")


  bottom_of_range = int(sys.argv[1]) #inclusive
  top_of_range = int(sys.argv[2])  #exclusive

  print bottom_of_range
  print top_of_range

  paper_list = []
  count = 0

  with open(paper_list_file, 'r') as f:
    for line in f:
      # print line
      if count >= bottom_of_range and count < top_of_range:
        paper_list.append(line.rstrip() + ".txt")
      count += 1

  for paper in paper_list:
    source_name = papers_source_dir + paper
    # dest_name = output_dir + paper + ".xml"
    if os.path.isfile(source_name): 
      shutil.copy(source_name, output_dir + "raw/")






if __name__ == '__main__':
    main()