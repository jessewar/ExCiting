# ExCiting Project
ExCiting tries to make understanding research papers easier by summarizing the citations and descriptions that other authors have written about a paper. 
Read more about the project [here](writeup-final.pdf).

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

## Contributing
**Before you push:**
If you've made any changes to the database, run `sh export-data.sh` so that others will get your updates. 

**After you pull:**
Run `sh import-data.sh` to get any database updates and to get the aan dataset

