# ExCiting Project


## The annotation server

#### Access
Trevor and Jesse - I have added your public ssh keys you use for github to our server. I'm assuming at least one of them was the id_rsa.pub key that is used by default by peeps. 

If that assumption was correct, run this: `sh scripts/ssh-alias.sh` and you'll be able to type `ssh 454` to access our webserver.
If not, edit the name of your id_*.pub file to the appropriate name in that script and run it and you should be good to go. 

#### Starting the server
If the server is not already running, follow these instructions:
  1. cd web
  2. npm install
  3. npm run deploy

#### Viewing it in your browser
Go to http://104.131.46.248:8080


