# ExCiting Project
ExCiting tries to make understanding research papers easier by summarizing the citations and descriptions that other authors have written about a paper. 
Read more about the project [here](about.md).

## Usage
#### Dependencies
This project has a number of dependencies to use. 
  - We are using the [The ACL Anthology Network Release 2013](http://clair.eecs.umich.edu/aan/) dataset as our corpus of research papers because it came with a citation network.
  - We are using [ParsCit](http://aye.comp.nus.edu.sg/parsCit/) to "chunkify" the papers in our corpus. This tool extracts any intext citations and matches them up with the cited author and paper and outputs them in XML blocks.
  - A number of ML and NLP tools including [nltk](http://www.nltk.org/), [algorithmia](http://algorithmia.com), and [natural](https://github.com/NaturalNode/natural).
    - Installing NLTK
      - Run `pip install nltk`
      - Run this from a python session: `nltk.download()`
      - Install all of the packages for the easiest time.
    - Install any node packages using the `package.json` files in the directories.
  - MongoDB. This project assumes that you have mongo installed and have a running mongod process.

#### Data Preperation
We've included the latest database dump in this repo. Run `sh import-data.sh` to import it into your mongo instance. This will also download the aan dataset we used and extract it for you. That dataset is quite large, so if you don't need to use it, you should delete it from your disk.

If you want to rebuild our database, it will require some work. Here are the steps:

##### Getting papers and their metadata in mongo
  1. From the root dir, `cd scripts/data_prep`
  2. `python papers_collection.py` 
  3. You'll now have the `papers` collection in your mongo database.
  

##### "Chunkifying" papers
  1. Make sure that you have the aan dataset locally (you can use `sh import-data.sh`, or go to the ACL link above and download) and have it placed in data/repo-exclude/aan.
  2. Install ParsCit (see above) and place it into the directory beneath where this repository is located.
  3. `cd scripts/data_prep`
  4. Repeat for the UW papers and the non-UW Papers:
    1. `python paper_subset.py [start-range, end-range]` (`python uw_papers.py` for uw papers) where start-range and end-range denote which papers you want to run ParsCit on.
      - There are ~8300 papers in the non-UW subset of aan. We've run on all of these papers. It is recommended to parallize the ParsCit work because it is quite slow.
    2. `sh parscit-script.sh`
      - This could take up to 24 hours to run on a single machine.
    3. `node chunkify.js`
      - You will probably need to update some paths in that file to match your machine.
  7. You should now have the `chunks` and `uw_chunks` collections in your mongo database.


##### Sentence Extractions
  1. From the root dir, `cd scripts/extract`
  2. `python context_extractor.py chunks re_sentence_extractions` for the non-UW ones
  3. `python context_extractor.py uw_chunks uw_re_sentence_extractions` for the UW ones
  4. You'll now have `re_sentence_extractions` and `uw_re_sentence_extractions` in your mongo database

##### Clusters
##### Summarizers



## Contributing
**Before you push:**
If you've made any changes to the database, run `sh export-data.sh` so that others will get your updates. 

**After you pull:**
Run `sh import-data.sh` to get any database updates and to get the aan dataset

