use exciting
// db.chunks.aggregate([
//    {"$group" : { "_id" : {"cited_paper" : "$cited_paper"} } }, 
//    {"$group" : {"_id" : 0, "papers" : {"$push" : "$_id.cited_paper"}, "count" : {"$sum" : 1}}}
//    ])



db.papers.aggregate([{"$match" : {"paper_id" :{"$in" : [ "P97-1003", "N03-1020", "C92-2070", "J95-4004", "H05-1044", "J96-1002", "H05-1066", "P05-1033", "W06-2920", "P04-1054", "J93-1003", "P98-2127", "P93-1024", "W05-0620", "J97-3002", "J04-4002", "J05-1004", "W02-1018", "W04-3250", "P05-1074", "P99-1067", "P05-1022", "P01-1067", "A00-1031", "P98-1013", "W02-1001", "W05-0909", "P97-1023", "M95-1005", "N03-1033", "P07-2045", "J95-2003", "P03-1021", "C96-1058", "P04-1035", "W95-0107", "P95-1037", "N03-1017", "W03-0419", "J02-3001", "J93-1007", "P02-1038", "P05-1034", "P05-1045", "P02-1053", "P02-1034", "P96-1041", "J90-2002", "P95-1026", "N07-1051", "C92-2082", "P05-1066", "J01-4004", "P06-1077", "A88-1019", "J94-2001", "J96-2004", "W99-0604", "P02-1040", "P00-1056", "P05-1012", "J93-2003", "J92-4003", "P02-1014", "P96-1025", "J94-4002", "J91-1002", "A00-2018", "J98-1004", "N03-1028", "J90-1003", "W96-0213", "C96-2141", "W99-0613", "J93-2004", "E06-1011", "H94-1020", "P90-1034", "W02-1011", "P03-1054", "A92-1021", "P06-1121", "J03-1002", "W04-1013", "N03-1003" ]} }}, {"$project" : {"title" : "$title"} }], cursor=false)