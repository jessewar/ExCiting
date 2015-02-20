use admin
db.runCommand({renameCollection: 'test.chunk', to: 'exciting.chunks'})
db.runCommand({renameCollection: 'mongodata.re_sentence_extractions', to: 'exciting.re_sentence_extractions'})