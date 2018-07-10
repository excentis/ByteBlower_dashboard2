#!/bin/sh

{
	cd /root/dashboard-excentis/;
	npm start&
}
{
	cd /root/dashboard-excentis/byteblower_poller
	python poll.py
}


