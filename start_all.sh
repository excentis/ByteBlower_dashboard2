#!/bin/sh

{
	cd /root/dashboard-excentis/server/;
	node server.js&
}
{
	cd /root/dashboard-excentis/byteblower_poller
	python poll.py
}


