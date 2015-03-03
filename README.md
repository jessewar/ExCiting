# ExCiting Project
ExCiting tries to make understanding research papers easier by summarizing the citations and descriptions that other authors have written about a paper. 
Read more about the project [here](about.md).


## Usage



### Dependencies
This project has a number of dependencies to use. 
  - We are using the [The ACL Anthology Network Release 2013](http://clair.eecs.umich.edu/aan/) dataset as our corpus of research papers because it came with a citation network.
  - We are using [ParsCit](http://aye.comp.nus.edu.sg/parsCit/) to "chunkify" the papers in our corpus. This tool extracts any intext citations and matches them up with the cited author and paper and outputs them in XML blocks.
  - A number of ML and NLP tools including [nltk](http://www.nltk.org/), [algorithmia](http://algorithmia.com), and [natural](https://github.com/NaturalNode/natural).


## NLTK
  - Run `pip install nltk`
  - Run this from a python session: `nltk.download()`
  - Install all of the packages for the easiest time.



## Contributing
**Before you push:**
If you've made any changes to the database, run `sh export-data.sh` so that others will get your updates. 

**After you pull:**
Run `sh import-data.sh` to get any database updates and to get the aan dataset

