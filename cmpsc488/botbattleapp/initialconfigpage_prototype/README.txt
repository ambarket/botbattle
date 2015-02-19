Installing mondodb
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/


On Ubuntu 14.04

Install Eclipse Luna by following instrustions on website

Install Nodeclipse plugin according to http://www.nodeclipse.org/updates/

I had to tell eclipse the path to my nodejs executable (/usr/bin/nodejs) in preferences somewhere

Getting git to work. Luna should already have EGit installed

Go to preferences->team->git->configuration and add your email and username as key pairs

  key: user.email
  value: ambarket@gmail.com

  key: user.name
  value: ambarket

To share project with git
right click on project -> team -> share project

Have to setup the pull requests, i forget how i got this to work