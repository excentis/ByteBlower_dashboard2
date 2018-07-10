# Required Software
* Git
* NodeJs
* npm
* python

# Installing
```ssh
$ git clone https://github.com/excentis/ByteBlower_dashboard2.git
$ cd ByteBlower-dashboard2
$ npm start
```
npm start will set NODE_ENV to production and run the server

before npm start a hook will be exececuted named 'poststart' this will install all packages and create the build environment.

# Using the project
## updating dashboards
> Client Side
```sh
$ cd src
$ nano/vim app.js
```
Then add this code to the Grid Tags in the file:
```html
     <Meter roomName="<<VENDOR NAME>>" socket={socket}/>

```
Also add an image of to the public/images folder

> Script Side
```sh
$ cd byteblower-poller
$ nano/vim poller.py
```
Change the IP address at the top CTRL+F for 'vendors' and read comments