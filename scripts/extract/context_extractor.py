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
		if chunk_text[left] == ' ' and re.search(end_sentence, chunk_text[left-1]) is not None:
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
		if re.search(end_sentence, chunk_text[right]) is not None:
			break
		elif chunk_text[right] == '(':
			open_parans += 1
		elif chunk_text[right] == ')':
			close_parans += 1
		right += 1

	# extract the exact sentence containing the chunk
	sentence = chunk_text[left:right]
	sentence = preprocess_sentence(sentence)

	# print('chunk_text : ', chunk_text)
	# print('cite_str : ', cite_str)
	# print('sentence : ', sentence)

	# route the sentence/cite_str to the appropriate context generator
	# based off of how many individual citation blocks are present
	try:
		if open_parans <= 1 and close_parans <= 1:
			return gen_best_context_single_block(sentence, cite_str)
		else:
			return gen_best_context_multiple_blocks(sentence, cite_str)
	except Exception as err:
		# give up, this only happens ~25 times on our data set due
		# to unbalanced parans
		return None

def preprocess_chunk(chunk_text):
	"""
	Preprocesses a chunk string for citation context extraction.

	Args:
		chunk_text the chunk string to process
	Returns:
		a processed version of the chunk_text
	"""

	# do our best to remove periods
	chunk_text.replace('e.g.', 'eg')
	chunk_text.replace('i.e.', 'ie')
	chunk_text.replace('etal.', 'et al')

	return chunk_text

def preprocess_sentence(sentence):
	"""
	Preprocesses a sentence for citation context extraction

	Args:
		sentence the sentence string to process
	Returns:
		a processed version of the sentence
	"""

	# at some point we'll want to get this to work
	# re.escape(sentence)
	return sentence

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
	end_re = '(.*)\\([^(]*' + cite_str + '[^)]*\\)'
	match_obj = re.search(end_re, sentence)
	if match_obj is not None:
		return match_obj.group(1)

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
	prefix_re = '([^,)]*)\\([^(]*' + cite_str + '[^)]*\\)'
	match_obj = re.search(prefix_re, sentence)
	if match_obj is not None:
		return match_obj.group(1)

	return None

def main():
	"""
	main
	"""
	# connect to mongod instance
	client = pymongo.MongoClient()

	# get database
	db = client.exciting

	# get chunk collection
	chunk_col = db.chunks

	# get output collection
	output_col = db.re_sentence_extractions

	# things to insert
	inserts = []

	for chunk_bson in chunk_col.find(
	spec = {'citation_text': {'$ne' : 'null'}, 'text': {'$ne' : ''}},
	fields = ['text', 'citation_text', 'cited_paper']):
		chunk_id = str(chunk_bson['_id'])
		chunk_text = chunk_bson['text']
		cite_str = chunk_bson['citation_text']
		cited_paper = chunk_bson['cited_paper']

		citation_context = generate_context(chunk_text, cite_str)
		if citation_context is not None:
			inserts.append({'chunk_id' : chunk_id,
				'cited_paper' : cited_paper,
				'extraction' : citation_context})

	# output_col.insert(inserts)

if __name__ == '__main__':
	main()