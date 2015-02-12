"""
Scripts to generate citation contexts programmatically (e.g. using regex).

Note: a citation block is defined as a single citation grouping with
one or more references bounded by a single paranthetical pair.

(Smith 2009) and (Smith et al 2010, Johnson 2011) are both
examples of a single citation block.
"""

import re
import pymongo

def generate_context(chunk_text, cite_str):
	"""
	Generates a citation context for the citation in the chunk.

	Args:
		chunk_text: the chunk string containing the citation
		cite_str: the raw text string of the citation (e.g. 'Smith, 2009')
	Returns:
		a citation context string for the cite_str if one can be determined,
		otherwise None
	"""

	# pre-process chunk
	chunk_text = preprocess_chunk(chunk_text)

	# first, try and find a substring match of cite_str in chunk_text
	pos = chunk_text.find(cite_str)
	if pos == -1:
		return None

	# matches punctuation that ends a sentence
	end_sentence = r"[.?!]"

	"""
	We then manually find the bounds of the sentence containing the citation
	literal. We also keep track of how many separate citation blocks there
	are by counting the number of () pairs
	"""
	open_parans = 0
	close_parans = 0

	# first, go left until we reach the beginning of a sentence
	left = pos;
	while left > 0:
		if chunk_text[left] == ' ' and end_sentence.search(chunk_text[left-1]) is not None:
			break
		elif chunk_text[left] == '(':
			open_parans += 1
		elif chunk_text[left] == ')':
			close_parans += 1
		left -= 1

	# next go right until we reach the end of a sentence
	right = pos
	close_parans == 0
	while right < len(chunk_text):
		if end_sentence.search(chunk_text[posright]) is not None:
			break
		elif chunk_text[right] == '(':
			open_parans += 1
		elif chunk_text[right] == ')':
			close_parans += 1
		right += 1

	# extract the exact sentence containing the chunk
	sentence = chunk_text[left:right]

	# route the sentence/cite_str to the appropriate context generator
	# based off of how many individual citation blocks are present
	if open_parans <= 1 and close_parans <= 1:
		return gen_best_context_single_block(sentence, cite_str)
	else:
		return gen_best_context_multiple_blocks(sentence, cite_str)

def gen_best_context_single_block(sentence, cite_str):
	"""
	Generates a citation context for the citation in the sentence. Assumes
	that there is only a single citation block in the sentence.

	Args:
		sentence: the sentence string containing the citation
		cite_str: the raw text string of the citation (e.g. 'Smith, 2009')
	Returns:
		a citation context string for the cite_str if one can be determined,
		otherwise None
	"""

	"""
	If there is only a single block, we try to extract data in the
	following order:

	1. Some text (citation) some more text. (i.e. citation in middle)
	2. (citation) some text. (i.e. citation at beginning)
	3. Some text (citation). (i.e. citation at end)
	"""

	# capture beginning of sentence and end of sentence, but not
	# the citation itself
	middle_re = '(.*)\\([^(]*' + cite_str + '[^)]*\\)[, ](.*)'
	match_obj = re.search(middle_re, sentence)
	if match_obj is not None:
		return match_obj.group(1) + match_obj.group(2)

	# capture end of sentence but not citation at beginning of sentence
	beginning_re = '\\([^(]*' + cite_str + '[^)]*\\)[, ](.*)'
	match_obj = re.search(beginning_re, sentence)
	if match_obj is not None:
		return match_obj.group(1)

	# capture beginning of sentence but not citation at end of sentence
	end_re = '(.*)([^(]*' + cite_str + '[^)]*\\)'
	match_obj = re.search(end_re, sentence)
	if match_obj is not None:
		return match_obj.group(2)

	return None

def gen_best_context_multiple_blocks(sentence, cite_str):
	"""
	Generates a citation context for the citation in the sentence. Assumes
	that there are multiple citation blocks in the sentence.

	Args:
		sentence: the sentence string containing the citation
		cite_str: the raw text string of the citation (e.g. 'Smith, 2009')
	Returns:
		a citation context string for the cite_str if one can be determined,
		otherwise None
	"""

	"""
	If there are multiple citation block, we try and capture the text
	after any preceding citation blocks or commas up to the citation 
	block associated with the specified cite_str.
	"""

	# capture text before citation and after preceding citation or comma
	prefix_re = '([^,)]*)([^(]*' + cite_str + '[^)]*\\)'
	match_obj = re.search(prefix_re, sentence)
	if match_obj is not None:
		return match_obj.group(1)

	return None

def preprocess_chunk(chunk_text):
	"""
	Preprocesses a chunk string for citation context extraction.

	Args:
		chunk_text the chunk string to process
	Returns:
		a processed version of the chunk_text
	"""

	# turn i.e. and e.g. into ie, eg respectively
	chunk_text.replace('e.g.', 'eg')
	chunk_text.replace('i.e., ie')

	return chunk_text

def main():
	client = pymongo.MongoClient()
	db = client.mongodata
	chunks = db.chunk
	print(chunks.find_one())

if __name__ == '__main__':
	main()