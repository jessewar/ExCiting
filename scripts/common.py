import pymongo
import pprint

# establish a connection to the database
connection = pymongo.MongoClient("localhost", 27017)
db = connection.exciting

pp = pprint.PrettyPrinter(indent=2)